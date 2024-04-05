package trips

import (
	"sort"

	"github.com/merzzzl/tuda/internal/api"
	"github.com/rs/zerolog/log"
)

func LoadPrices(trip *Trip) *Trip {
	for j, road := range trip.Roads {
		prices, err := api.FetchPrices(road.FromIATA, road.ToIATA)
		if err != nil {
			log.Err(err).Str("from", road.FromIATA).Str("to", road.ToIATA).Msg("load prices failed")

			return nil
		}

		for k := 0; k < len(prices); k++ {
			if prices[k].Price <= 0 {
				prices = append(prices[:k], prices[k+1:]...)
				k--
			}
		}

		if len(prices) == 0 {
			return nil
		}

		sort.Slice(prices, func(i, j int) bool {
			return prices[i].Price < prices[j].Price
		})

		trip.Roads[j].Flight = prices[0]
		trip.FullPrice += prices[0].Price
	}

	return trip
}
