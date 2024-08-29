package main

import (
	"crypto/tls"
	"net/http"
	"os"
	"time"

	"github.com/merzzzl/tuda/internal/server"
	"github.com/merzzzl/tuda/internal/service"
	"github.com/rs/zerolog"
)

const (
	TTL = time.Hour * 6
)

var Token = os.Getenv("TOKEN")

func main() {
	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	srv := service.NewService(Token, TTL)

	if err := server.Handl(srv); err != nil {
		panic(err)
	}
}
