import {
  IAcceptSpeakerInviteResponse,
  IActivePingResponse,
  ICompletePhoneNumberAuthResponse,
  IGetChannelsResponse,
  IJoinChannelResponse,
  ILeaveChannelResponse,
  IRaiseHandResponse,
  IStartPhoneNumberAuthResponse,
} from './interface/request';

const URL = 'https://chapp.link/api/clubhouse';

export async function doStartPhoneNumberAuth(data: { phone_number: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/start_phone_number_auth`, requestOptions);
  return response.json() as Promise<IStartPhoneNumberAuthResponse>;
}

export async function doCompletePhoneNumberAuth(data: { phone_number: string; verification_code: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/complete_phone_number_auth`, requestOptions);
  return response.json() as Promise<ICompletePhoneNumberAuthResponse>;
}

export async function doGetChannels(data: { user_id: string; token: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/get_channels`, requestOptions);
  return response.json() as Promise<IGetChannelsResponse>;
}

export async function doJoinChannel(data: { user_id: string; token: string; channel: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/join_channel`, requestOptions);
  return response.json() as Promise<IJoinChannelResponse>;
}

export async function doLeaveChannel(data: { user_id: string; token: string; channel: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/leave_channel`, requestOptions);
  return response.json() as Promise<ILeaveChannelResponse>;
}

export async function doActivePing(data: { user_id: string; token: string; channel: string }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/active_ping`, requestOptions);
  return response.json() as Promise<IActivePingResponse>;
}

export async function doRaiseHand(data: { user_id: string; token: string; channel: string; raise_hands: boolean }) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/audience_reply`, requestOptions);
  return response.json() as Promise<IRaiseHandResponse>;
}

export async function doAcceptSpeakerInvite(data: {
  user_id: string;
  target_user_id: number;
  token: string;
  channel: string;
}) {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  const response = await fetch(`${URL}/accept_speaker_invite`, requestOptions);
  return response.json() as Promise<IAcceptSpeakerInviteResponse>;
}
