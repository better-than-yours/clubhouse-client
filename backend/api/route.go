package api

import (
	"crypto/sha1"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/render"
	"github.com/google/uuid"
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
	hash := sha1.Sum([]byte(data.UserID))
	hashReader := strings.NewReader(string(hash[:]))
	deviceID := uuid.Must(uuid.NewRandomFromReader(hashReader))
	var credentials = map[string]string{
		"CH-DeviceId":   deviceID.String(),
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

// LeaveChannelRequest is the request structure of the LeaveChannel method
type LeaveChannelRequest struct {
	GetChannelsRequest
	Channel string `json:"channel"`
}

func (s *Server) leaveChannel(w http.ResponseWriter, r *http.Request) {
	data := &LeaveChannelRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	setCredentials(&GetChannelsRequest{UserID: data.UserID, Token: data.Token})
	response, err := clubhouseapi.LeaveChannel(data.Channel)
	if err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	renderSuccess(w, r, response)
}

// ActivePingRequest is the request structure of the ActivePing method
type ActivePingRequest struct {
	GetChannelsRequest
	Channel string `json:"channel"`
}

func (s *Server) activePing(w http.ResponseWriter, r *http.Request) {
	data := &ActivePingRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	setCredentials(&GetChannelsRequest{UserID: data.UserID, Token: data.Token})
	response, err := clubhouseapi.ActivePing(data.Channel)
	if err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	renderSuccess(w, r, response)
}

// AudienceReplyRequest is the request structure of the AudienceReply method
type AudienceReplyRequest struct {
	GetChannelsRequest
	Channel    string `json:"channel"`
	RaiseHands bool   `json:"raise_hands"`
}

func (s *Server) audienceReply(w http.ResponseWriter, r *http.Request) {
	data := &AudienceReplyRequest{}
	if err := render.DecodeJSON(http.MaxBytesReader(w, r.Body, bodyLimit), &data); err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	setCredentials(&GetChannelsRequest{UserID: data.UserID, Token: data.Token})
	response, err := clubhouseapi.AudienceReply(data.Channel, data.RaiseHands)
	if err != nil {
		renderInternalServerError(w, r, err)
		return
	}
	renderSuccess(w, r, response)
}
