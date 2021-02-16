package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/render"
	"github.com/lafin/clubhouseapi"
)

func renderInternalServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Println(err)
	render.Status(r, http.StatusInternalServerError)
	render.PlainText(w, r, "InternalServerError")
}

func renderSuccess(w http.ResponseWriter, r *http.Request, response interface{}) {
	render.Status(r, http.StatusOK)
	render.JSON(w, r, response)
}

func setCredentials(data *GetChannelsRequest) {
	var credentials = map[string]string{
		"CH-DeviceId":   "b5c07613-faeb-4bc6-901f-bce7516cb344",
		"CH-UserID":     data.UserID,
		"Authorization": fmt.Sprintf(`Token %s`, data.Token),
	}
	clubhouseapi.AddCredentials(credentials)
}

// StartPhoneNumberAuthRequest is the request structure of the StartPhoneNumberAuth method
type StartPhoneNumberAuthRequest struct {
	PhoneNumber string `json:"phone_number"`
}

func (s *Server) startPhoneNumberAuth(w http.ResponseWriter, r *http.Request) {
	data := &StartPhoneNumberAuthRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	response, err := clubhouseapi.StartPhoneNumberAuth(data.PhoneNumber)
	if err != nil {
		renderInternalServerError(w, r, err)
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
		renderInternalServerError(w, r, err)
		return
	}
	response, err := clubhouseapi.CompletePhoneNumberAuth(data.PhoneNumber, data.VerificationCode)
	if err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	renderSuccess(w, r, response)
}

// GetChannelsRequest is the request structure of the GetChannels method
type GetChannelsRequest struct {
	UserID string `json:"user_id"`
	Token  string `json:"token"`
}

func (s *Server) getChannels(w http.ResponseWriter, r *http.Request) {
	data := &GetChannelsRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	setCredentials(&GetChannelsRequest{UserID: data.UserID, Token: data.Token})
	response, err := clubhouseapi.GetChannels()
	if err != nil {
		renderInternalServerError(w, r, err)
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
		renderInternalServerError(w, r, err)
		return
	}
	setCredentials(&GetChannelsRequest{UserID: data.UserID, Token: data.Token})
	response, err := clubhouseapi.JoinChannel(data.Channel)
	if err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	renderSuccess(w, r, response)
}
