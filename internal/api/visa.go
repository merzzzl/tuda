package api

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/rs/zerolog/log"
)

var cacheFetchVisa = newCache[bool]()

func FetchVisa(from, to string) (bool, error) {
	if res, ok := cacheFetchVisa.Load(from + to); ok {
		return res, nil
	}

	log.Debug().Str("from", from).Str("to", to).Msg("check visa")

	data := url.Values{}
	data.Set("d", to)
	data.Set("s", from)

	req, err := http.NewRequest("POST", "https://www.passportindex.org/core/visachecker.php", bytes.NewBufferString(data.Encode()))
	if err != nil {
		return false, err
	}

	req.Header.Set("X-Requested-With", "XMLHttpRequest")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("Connection", "close")

	resp, err := cli.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("bad status %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	if len(body) == 0 {
		return false, http.ErrBodyNotAllowed
	}

	var res bool

	if !strings.Contains(strings.ToLower(string(body)), "tvvr") {
		res = true
	}

	cacheFetchVisa.Store(from+to, res)

	return res, nil
}
