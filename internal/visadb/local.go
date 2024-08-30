package visadb

import (
	"embed"
	"encoding/csv"
	"errors"
	"io"
	"slices"
	"strings"
)

//go:embed passport-index.csv
var staticFS embed.FS
var visas = csvToMap()
var required = []string{
	"visa required",
}

func csvToMap() map[string]map[string]string {
	file, err := staticFS.Open("passport-index.csv")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)

	result := make(map[string]map[string]string)

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			panic(err)
		}

		key1 := strings.ToLower(record[0])
		key2 := strings.ToLower(record[1])
		value := strings.ToLower(record[2])

		if _, ok := result[key1]; !ok {
			result[key1] = make(map[string]string)
		}

		result[key1][key2] = value
	}

	return result
}

func FetchVisa(from, to string) (bool, error) {
	passport, ok := visas[from]
	if !ok {
		return false, errors.New("passport not found")
	}

	visa, ok := passport[to]
	if !ok {
		return false, errors.New("visa not found")
	}

	if slices.Contains(required, visa) {
		return false, nil
	}

	return true, nil
}
