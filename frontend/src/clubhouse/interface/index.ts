import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

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
  client: IAgoraRTCClient;
  isHandraiseEnabled: boolean;
}
