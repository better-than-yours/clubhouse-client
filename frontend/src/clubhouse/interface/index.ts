import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import Pubnub from 'pubnub';

export interface ILogin {
  phone_number: string;
  verification_code?: string;
}

export interface IUser {
  token: string;
  user_profile: {
    user_id: number;
    name: string;
    photo_url: string;
    username: string;
  };
  enabled_voice_chat: boolean;
}

export interface ISelectedChannel {
  channelId: string;
  agora?: IAgoraRTCClient;
  pubnub?: Pubnub;
  isHandraiseEnabled: boolean;
  isRaiseHand: boolean;
  isMicActive: boolean;
  hasInvite: boolean;
  isAcceptInvite: boolean;
}
