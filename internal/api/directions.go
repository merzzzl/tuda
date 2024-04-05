package api

import (
	"encoding/json"
	"io"

	"github.com/rs/zerolog/log"
)

type FlightInfo struct {
	Destination string `json:"destination"`
}

type Direction struct {
	Direct bool   `json:"direct"`
	Iata   string `json:"iata"`
}

var cacheFetchDirections = newCache[[]Direction]()

func FetchDirections(iata string) ([]Direction, error) {
	if res, ok := cacheFetchDirections.Load(iata); ok {
		return res, nil
	}

	log.Debug().Str("from", iata).Msg("load list of directions")

	resp, err := cli.Get("http://map.aviasales.com/supported_directions.json?origin_iata=" + iata + "&one_way=true&locale=en")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var supportedDirections struct {
		Directions []Direction `json:"directions"`
	}

	err = json.Unmarshal(body, &supportedDirections)
	if err != nil {
		return nil, err
	}

	for i := 0; i < len(supportedDirections.Directions); i++ {
		if !supportedDirections.Directions[i].Direct {
			supportedDirections.Directions = append(supportedDirections.Directions[:i], supportedDirections.Directions[i+1:]...)
			i--
		}
	}

	cacheFetchDirections.Store(iata, supportedDirections.Directions)

	return supportedDirections.Directions, nil
}
