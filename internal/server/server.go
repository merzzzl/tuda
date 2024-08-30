package server

import (
	"embed"
	"encoding/json"
	"net/http"
	"net/http/pprof"
	"strconv"
	"strings"

	"github.com/merzzzl/tuda/internal/api"
	"github.com/merzzzl/tuda/internal/service"
	"github.com/merzzzl/tuda/internal/visadb"
	"github.com/rs/cors"
	"github.com/rs/zerolog/log"
)

//go:embed embed/*
var staticFS embed.FS

func Handl(srv *service.Service) error {
	citiesRaw, err := api.FetchCities()
	if err != nil {
		return err
	}

	cities := make(map[string]api.City)
	for _, city := range citiesRaw {
		cities[city.Code] = city
	}

	mux := http.NewServeMux()

	if srv.Debug {
		mux.HandleFunc("/debug/pprof/", pprof.Index)
		mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
		mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
		mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
		mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
		mux.Handle("/debug/pprof/block", pprof.Handler("block"))
		mux.Handle("/debug/pprof/goroutine", pprof.Handler("goroutine"))
		mux.Handle("/debug/pprof/heap", pprof.Handler("heap"))
		mux.Handle("/debug/pprof/threadcreate", pprof.Handler("threadcreate"))
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			r.URL.Path = "/index.html"
		}

		filePath := "embed" + r.URL.Path

		file, err := staticFS.Open(filePath)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		defer file.Close()

		fileInfo, err := file.Stat()
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if fileInfo.IsDir() {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		buff := make([]byte, fileInfo.Size())
		_, err = file.Read(buff)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if strings.Contains(filePath, "/static/css/") {
			w.Header().Set("Content-Type", "text/css")
		}

		if strings.Contains(filePath, "/static/js/") {
			w.Header().Set("Content-Type", "text/javascript")
		}

		w.Write(buff)
	})

	subMux := http.NewServeMux()

	subMux.HandleFunc("/cities", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(cities)
	})

	subMux.HandleFunc("/places", func(w http.ResponseWriter, r *http.Request) {
		places, err := api.FetchPlaces(r.URL.Query().Get("type"), r.URL.Query().Get("term"))
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		json.NewEncoder(w).Encode(places)
	})

	subMux.HandleFunc("/find_road", func(w http.ResponseWriter, r *http.Request) {
		passport := r.URL.Query().Get("passport")
		passport = strings.ToLower(passport)
		_, err := visadb.FetchVisa(passport, passport)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		startIATA := r.URL.Query().Get("start_iata")
		if _, ok := cities[startIATA]; !ok {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		roads := srv.Roads(passport, startIATA)

		json.NewEncoder(w).Encode(roads)
	})

	subMux.HandleFunc("/find_trip", func(w http.ResponseWriter, r *http.Request) {
		passport := r.URL.Query().Get("passport")
		passport = strings.ToLower(passport)
		_, err := visadb.FetchVisa(passport, passport)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		startIATA := r.URL.Query().Get("start_iata")
		if _, ok := cities[startIATA]; !ok {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		endIATA := r.URL.Query().Get("end_iata")
		if _, ok := cities[endIATA]; !ok {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		maxSteps := r.URL.Query().Get("max_steps")
		maxSrepsInt, err := strconv.Atoi(maxSteps)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		trips := srv.Trips(passport, startIATA, endIATA, maxSrepsInt)

		json.NewEncoder(w).Encode(trips)
	})

	mux.Handle("/api/", http.StripPrefix("/api", muxLog{sub: subMux}))

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
	})
	handler := c.Handler(mux)

	log.Info().Msg("server ready")

	return http.ListenAndServe(":8080", handler)
}

type muxLog struct {
	sub http.Handler
}

func (mux muxLog) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Info().Str("host", r.Host).Str("url", r.URL.String()).Msg("new request")

	mux.sub.ServeHTTP(w, r)
}
