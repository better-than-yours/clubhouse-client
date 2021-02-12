package main

import (
	"github.com/joho/godotenv"

	"github.com/better-than-yours/clubhouse-client/api"
)

func main() {
	_ = godotenv.Load()
	server := api.Server{}

	server.Run(3000)
}
