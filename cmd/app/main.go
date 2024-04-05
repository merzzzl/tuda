package main

import (
	"time"

	"github.com/merzzzl/tuda/internal/server"
	"github.com/merzzzl/tuda/internal/service"
	"github.com/rs/zerolog"
)

const (
	TTL   = time.Hour * 6
	Token = "<TOKEN>"
)

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	srv := service.NewService(Token, TTL)

	if err := server.Handl(srv); err != nil {
		panic(err)
	}
}
