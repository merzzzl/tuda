package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/rs/zerolog/log"
)

type Place struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

var cacheFetchPlaces = newCache[[]Place]()

func FetchPlaces(termTypes string, term string) ([]Place, error) {
	if res, ok := cacheFetchPlaces.Load(termTypes + term); ok {
		return res, nil
	}

	log.Debug().Str("termTypes", termTypes).Str("term", term).Msg("load places")

	baseURL := "https://autocomplete.travelpayouts.com/places2"
	params := url.Values{}
	params.Add("locale", "en")
	for _, termType := range strings.Split(termTypes, ",") {
		params.Add("types[]", termType)
	}
	params.Add("term", term)

	url := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	resp, err := cli.Get(url)
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

	var placesResponse []Place

	err = json.Unmarshal(body, &placesResponse)
	if err != nil {
		return nil, err
	}

	cacheFetchPlaces.Store(termTypes + term, placesResponse)

	return placesResponse, nil
}
