// Package api handle work with api
package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"gorm.io/gorm"
)

// Server provides HTTP API
type Server struct {
	Store      *gorm.DB
	httpServer *http.Server
}

// Run starts http server for API with all routes
func (s *Server) Run(port int) {
	router := chi.NewRouter()
	router.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
		render.PlainText(w, r, "OK")
	})
	s.httpServer = &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	err := s.httpServer.ListenAndServe()
	if err != nil {
		log.Fatalf("[ERROR] start http server, %s", err)
	}
}
