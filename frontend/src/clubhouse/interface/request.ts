export interface IStartPhoneNumberAuthResponse {
  success: boolean;
  is_blocked: boolean;
  error_message?: string;
}

export interface ICompletePhoneNumberAuthResponse {
  success: boolean;
  is_verified: boolean;
  number_of_attempts_remaining: number;
  user_profile: {
    user_id: number;
    name: string;
    photo_url: string;
    username: string;
  };
  auth_token: string;
  refresh_token: string;
  access_token: string;
  is_waitlisted: boolean;
  is_onboarding: boolean;
}

export interface IChannel {
  creator_user_profile_id: number;
  channel_id: number;
  channel: string;
  topic: string;
  is_private: boolean;
  is_social_mode: boolean;
  url: string;
  club: {
    club_id: number;
    name: string;
    description: string;
    photo_url: string;
    num_members: number;
    num_followers: number;
    enable_private: boolean;
    is_follow_allowed: boolean;
    is_membership_private: boolean;
    is_community: boolean;
    rules: {
      desc: string;
      title: string;
    }[];
    num_online: number;
  };
  club_name: string;
  club_id: number;
  welcome_for_user_profile?: any;
  num_other: number;
  has_blocked_speakers: boolean;
  is_explore_channel: boolean;
  num_speakers: number;
  num_all: number;
  users: {
    user_id: number;
    name: string;
    photo_url: string;
    is_speaker: boolean;
    is_moderator: boolean;
    time_joined_as_speaker: Date;
    is_followed_by_speaker: boolean;
    is_invited_as_speaker: boolean;
  }[];
}

export interface IEvent {
  event_id: number;
  name: string;
  description: string;
  time_start: Date;
  club: {
    club_id: number;
    name: string;
    description: string;
    photo_url: string;
    num_members: number;
    num_followers: number;
    enable_private: boolean;
    is_follow_allowed: boolean;
    is_membership_private: boolean;
    is_community: boolean;
    rules: {
      desc: string;
      title: string;
    }[];
    num_online: number;
  };
  is_member_only: boolean;
  url: string;
  hosts: {
    user_id: number;
    name: string;
    photo_url: string;
    username: string;
    bio: string;
    twitter: string;
  }[];
  channel: string;
  is_expired: boolean;
}

export interface IGetChannelsResponse {
  Channels: IChannel[];
  Events: IEvent[];
  success: boolean;
}

export interface IJoinChannelResponse {
  creator_user_profile_id: number;
  channel_id: number;
  channel: string;
  topic: string;
  is_private: boolean;
  is_social_mode: boolean;
  url: string;
  club: {
    club_id: number;
    name: string;
    description: string;
    photo_url: string;
    num_members: number;
    num_followers: number;
    enable_private: boolean;
    is_follow_allowed: boolean;
    is_membership_private: boolean;
    is_community: boolean;
    rules?: any;
    num_online: number;
  };
  club_name: string;
  club_id: number;
  welcome_for_user_profile?: any;
  is_handraise_enabled: boolean;
  handraise_permission: number;
  is_club_member: boolean;
  is_club_admin: boolean;
  users: {
    user_id: number;
    name: string;
    photo_url: string;
    username: string;
    first_name: string;
    skintone: number;
    is_new: boolean;
    is_speaker: boolean;
    is_moderator: boolean;
    time_joined_as_speaker: Date;
    is_followed_by_speaker: boolean;
    is_invited_as_speaker: boolean;
  }[];
  success: boolean;
  is_empty: boolean;
  token: string;
  rtm_token: string;
  pubnub_token: string;
  pubnub_origin?: any;
  pubnub_heartbeat_value: number;
  pubnub_heartbeat_interval: number;
  pubnub_enable: boolean;
  agora_native_mute: boolean;
}
