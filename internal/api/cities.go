package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"github.com/rs/zerolog/log"
)

type City struct {
	CountryCode string `json:"country_code"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Coordinates struct {
		Lat float64 `json:"lat"`
		Lon float64 `json:"lon"`
	} `json:"coordinates"`
}

var iataRxp = regexp.MustCompile(`[a-zA-Z]{3}`)

var cacheFetchCities = newCache[[]City]()

func FetchCities() ([]City, error) {
	if res, ok := cacheFetchCities.Load(""); ok {
		return res, nil
	}

	log.Debug().Msg("load list of airports")

	resp, err := cli.Get("https://api.travelpayouts.com/data/en/cities.json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bad status %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cities []City
	err = json.Unmarshal(body, &cities)
	if err != nil {
		return nil, err
	}

	for i := 0; i < len(cities); i++ {
		if !iataRxp.MatchString(cities[i].Code) {
			cities = append(cities[:i], cities[i+1:]...)
			i--
		}
	}

	cacheFetchCities.Store("", cities)

	return cities, nil
}
