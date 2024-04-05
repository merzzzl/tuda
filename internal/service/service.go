package service

import (
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/merzzzl/tuda/internal/api"
	"github.com/merzzzl/tuda/internal/trips"
	"github.com/rs/zerolog/log"
)

type Service struct {
	Debug             bool
	mutex             sync.Mutex
	TTL               time.Duration
	TripsHistory      map[string]Trips
}

type Trips struct {
	FoudAt time.Time     `json:"found_at"`
	Trips  []*trips.Trip `json:"trips"`
	Final  bool          `json:"final"`
}

type Directions struct {
	FoudAt time.Time     `json:"found_at"`
	Roads  []*trips.Road `json:"roads"`
}

func NewService(token string, ttl time.Duration) *Service {
	api.SetTTL(ttl)
	api.SetToken(token)

	return &Service{
		TripsHistory: map[string]Trips{},
		TTL:          ttl,
	}
}

func (s *Service) Roads(passport string, startIATA string) Directions {
	roads := trips.FindDirections(passport, startIATA)

	for i := 0; i < len(roads); i++ {
		prices, err := api.FetchPrices(roads[i].FromIATA, roads[i].ToIATA)
		if err != nil {
			log.Err(err).Str("from", roads[i].FromIATA).Str("to", roads[i].ToIATA).Msg("load prices failed")
			roads = append(roads[:i], roads[i+1:]...)
			i--
			continue
		}

		if len(prices) == 0 {
			roads = append(roads[:i], roads[i+1:]...)
			i--
			continue
		}

		sort.Slice(prices, func(i, j int) bool {
			return prices[i].Price < prices[j].Price
		})

		roads[i].Flight = prices[0]
	}

	return Directions{
		FoudAt: time.Now(),
		Roads:  roads,
	}
}

func (s *Service) Trips(passport string, startIATA, endIATA string, maxSteps int) Trips {
	key := fmt.Sprintf("%s-%s-%s-%d", passport, startIATA, endIATA, maxSteps)

	res, ok := s.tripsFromHistory(key)
	if ok {
		return res
	}

	tripsCh := make(chan *trips.Trip, 1)

	go func() {
		log.Debug().Str("key", key).Msg("search init")
		for trip := range tripsCh {
			go func(trip *trips.Trip) {
				trip = trips.LoadPrices(trip)
				if trip == nil {
					return
				}

				s.mutex.Lock()
				s.TripsHistory[key] = Trips{Trips: append(s.TripsHistory[key].Trips, trip), FoudAt: time.Now()}
				s.mutex.Unlock()
			}(trip)
		}

		s.mutex.Lock()
		s.TripsHistory[key] = Trips{Trips: s.TripsHistory[key].Trips, FoudAt: time.Now(), Final: true}
		s.mutex.Unlock()

		log.Debug().Str("key", key).Msg("search end")
	}()

	go trips.FindTrips(passport, startIATA, endIATA, maxSteps, tripsCh)

	return res
}

func (s *Service) tripsFromHistory(key string) (Trips, bool) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	res, ok := s.TripsHistory[key]
	if ok && time.Now().Before(res.FoudAt.Add(s.TTL)) {
		return res, true
	}

	res = Trips{Trips: []*trips.Trip{}, FoudAt: time.Now()}
	s.TripsHistory[key] = res

	return res, false
}
