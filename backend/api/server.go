// Package api handle work with api
package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/lafin/clubhouseapi"
)

const bodyLimit = 1024 * 64 // limit size of body

// Server provides HTTP API
type Server struct {
	httpServer *http.Server
}

// Run starts http server for API with all routes
func (s *Server) Run(port int) {
	router := chi.NewRouter()
	router.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
		render.PlainText(w, r, "OK")
	})
	router.Route("/clubhouse", func(r chi.Router) {
		r.Post("/start_phone_number_auth", s.startPhoneNumberAuth)
		r.Post("/complete_phone_number_auth", s.completePhoneNumberAuth)
		r.Post("/get_channels", s.getChannels)
		r.Post("/join_channel", s.joinChannel)
		r.Post("/refresh_token", s.refreshToken)
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

func renderInternalServerError(w http.ResponseWriter, r *http.Request) {
	render.Status(r, http.StatusInternalServerError)
	render.PlainText(w, r, "InternalServerError")
}

func renderSuccess(w http.ResponseWriter, r *http.Request, response interface{}) {
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

// StartPhoneNumberAuthRequest is the request structure of the StartPhoneNumberAuth method
type StartPhoneNumberAuthRequest struct {
	PhoneNumber string `json:"phone_number"`
}

func (s *Server) startPhoneNumberAuth(w http.ResponseWriter, r *http.Request) {
	data := &StartPhoneNumberAuthRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r)
		return
	}
	response, err := clubhouseapi.StartPhoneNumberAuth(data.PhoneNumber)
	if err != nil {
		renderInternalServerError(w, r)
		return
	}
	renderSuccess(w, r, response)
}

// CompletePhoneNumberAuthRequest is the request structure of the CompletePhoneNumberAuth method
type CompletePhoneNumberAuthRequest struct {
	PhoneNumber      string `json:"phone_number"`
	VerificationCode string `json:"verification_code"`
}

func (s *Server) completePhoneNumberAuth(w http.ResponseWriter, r *http.Request) {
	data := &CompletePhoneNumberAuthRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r)
		return
	}
	response, err := clubhouseapi.CompletePhoneNumberAuth(data.PhoneNumber, data.VerificationCode)
	if err != nil {
		renderInternalServerError(w, r)
		return
	}
	renderSuccess(w, r, response)
}

// GetChannelsRequest is the request structure of the GetChannels method
type GetChannelsRequest struct {
	UserID        string `json:"user_id"`
	Authorization string `json:"authorization"`
}

func (s *Server) getChannels(w http.ResponseWriter, r *http.Request) {
	data := &GetChannelsRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r)
		return
	}
	var credentials = map[string]string{
		"CH-UserID":     data.UserID,
		"Authorization": fmt.Sprintf(`Bearer %s`, data.Authorization),
	}
	clubhouseapi.AddCredentials(credentials)
	response, err := clubhouseapi.GetChannels()
	if err != nil {
		renderInternalServerError(w, r)
		return
	}
	renderSuccess(w, r, response)
}

// JoinChannelRequest is the request structure of the JoinChannel method
type JoinChannelRequest struct {
	GetChannelsRequest
	Channel string `json:"channel"`
}

func (s *Server) joinChannel(w http.ResponseWriter, r *http.Request) {
	data := &JoinChannelRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r)
		return
	}
	var credentials = map[string]string{
		"CH-UserID":     data.UserID,
		"Authorization": fmt.Sprintf(`Bearer %s`, data.Authorization),
	}
	clubhouseapi.AddCredentials(credentials)
	response, err := clubhouseapi.JoinChannel(data.Channel)
	if err != nil {
		renderInternalServerError(w, r)
		return
	}
	renderSuccess(w, r, response)
}

// RefreshTokenRequest is the request structure of the RefreshToken method
type RefreshTokenRequest struct {
	Refresh string `json:"refresh"`
}

func (s *Server) refreshToken(w http.ResponseWriter, r *http.Request) {
	data := &RefreshTokenRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r)
		return
	}
	response, err := clubhouseapi.RefreshToken(data.Refresh)
	if err != nil {
		renderInternalServerError(w, r)
		return
	}
	renderSuccess(w, r, response)
}
