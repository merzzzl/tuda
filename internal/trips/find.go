package trips

import (
	"strings"
	"sync"

	"github.com/merzzzl/tuda/internal/api"
	"github.com/merzzzl/tuda/internal/visadb"
	"github.com/rs/zerolog/log"
)

type Road struct {
	FromIATA string        `json:"from_iata"`
	ToIATA   string        `json:"to_iata"`
	Flight   api.PriceInfo `json:"flight"`
}

type Trip struct {
	FullPrice int    `json:"full_price"`
	Roads     []Road `json:"roads"`
}

func FindDirections(passport string, currentIATA string) []*Road {
	cities, err := api.FetchCities()
	if err != nil {
		log.Err(err).Msg("load airports failed")
		return nil
	}

	country := make(map[string]string, len(cities))
	for _, city := range cities {
		country[city.Code] = strings.ToLower(city.CountryCode)
	}

	dirs, err := api.FetchDirections(currentIATA)
	if err != nil {
		log.Err(err).Str("iata", currentIATA).Msg("load directions failed")
		return nil
	}

	roads := []*Road{}

	for _, flight := range dirs {
		neighborIATA := flight.Iata

		cn, ok := country[neighborIATA]
		if !ok {
			continue
		}

		visaOK, err := visadb.FetchVisa(passport, cn)
		if err != nil {
			log.Err(err).Str("from", passport).Str("to", cn).Msg("visa check failed")
			continue
		}

		if !visaOK && passport != cn {
			continue
		}

		roads = append(roads, &Road{
			FromIATA: currentIATA,
			ToIATA:   neighborIATA,
			Flight:   api.PriceInfo{},
		})
	}

	return roads
}

func FindTrips(passport string, startIATA, endIATA string, maxSteps int, state chan<- *Trip) {
	defer close(state)

	cities, err := api.FetchCities()
	if err != nil {
		log.Err(err).Msg("load airports failed")
		return
	}

	country := make(map[string]string, len(cities))
	for _, city := range cities {
		country[city.Code] = strings.ToLower(city.CountryCode)
	}

	var findPaths func(currentIATA string, visited map[string]bool, currentPath []Road, steps int)
	findPaths = func(currentIATA string, visited map[string]bool, currentPath []Road, steps int) {
		if steps > maxSteps {
			return
		}

		if currentIATA == endIATA {
			log.Debug().Str("from", startIATA).Str("to", endIATA).Int("steps", len(currentPath)).Msg("found new trip")

			newPath := make([]Road, len(currentPath))
			copy(newPath, currentPath)

			state <- &Trip{
				Roads: newPath,
			}

			return
		}

		if steps == maxSteps {
			return
		}

		dirs, err := api.FetchDirections(currentIATA)
		if err != nil {
			log.Err(err).Str("iata", currentIATA).Msg("load directions failed")
			return
		}

		wg := sync.WaitGroup{}

		for _, flight := range dirs {
			neighborIATA := flight.Iata
			if visited[neighborIATA] {
				continue
			}

			cn, ok := country[neighborIATA]
			if !ok {
				continue
			}

			visaOK, err := visadb.FetchVisa(passport, cn)
			if err != nil {
				log.Err(err).Str("from", passport).Str("to", cn).Msg("visa check failed")
				continue
			}

			if !visaOK && passport != cn {
				continue
			}

			road := Road{
				FromIATA: currentIATA,
				ToIATA:   neighborIATA,
				Flight:   api.PriceInfo{},
			}

			localCurrentPath := make([]Road, len(currentPath))
			copy(localCurrentPath, currentPath)
			localCurrentPath = append(localCurrentPath, road)

			localVisited := make(map[string]bool, len(visited))
			for k, v := range visited {
				localVisited[k] = v
			}
			localVisited[neighborIATA] = true

			wg.Add(1)
			go func() {
				defer wg.Done()

				findPaths(neighborIATA, localVisited, localCurrentPath, steps+1)
			}()
		}

		wg.Wait()
	}

	findPaths(startIATA, map[string]bool{startIATA: true}, []Road{}, 0)
}
