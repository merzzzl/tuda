package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/rs/zerolog/log"
)

type PriceInfo struct {
	DepartureAt  time.Time `json:"departure_at"`
	Price        int       `json:"price"`
	Duration     int       `json:"duration"`
	Airline      string    `json:"airline"`
	FlightNumber string    `json:"flight_number"`
	Link         string    `json:"link"`
}

var cacheFetchPrices = newCache[[]PriceInfo]()

func FetchPrices(origin string, destination string) ([]PriceInfo, error) {
	if res, ok := cacheFetchPrices.Load(origin + destination); ok {
		return res, nil
	}

	log.Debug().Str("from", origin).Str("to", destination).Msg("load prices")

	baseURL := "http://api.travelpayouts.com/aviasales/v3/prices_for_dates"
	params := url.Values{}
	params.Add("currency", "usd")
	params.Add("origin", origin)
	params.Add("destination", destination)
	params.Add("one_way", "true")
	params.Add("direct", "true")
	params.Add("unique", "true")
	params.Add("token", token)
	params.Add("departure_at", time.Now().Format("2006-01-02"))

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

	var pricesResponse struct {
		Data []PriceInfo `json:"data"`
	}

	err = json.Unmarshal(body, &pricesResponse)
	if err != nil {
		return nil, err
	}

	for i := range pricesResponse.Data {
		pricesResponse.Data[i].Link = "https://aviasales.com" + pricesResponse.Data[i].Link
	}

	cacheFetchPrices.Store(origin+destination, pricesResponse.Data)

	return pricesResponse.Data, nil
}
