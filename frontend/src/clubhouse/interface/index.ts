export interface ILogin {
  phone_number: string;
  verification_code?: string;
}

export interface IUser {
  access_token: string;
  refresh_token: string;
  user_profile: {
    user_id: number;
    name: string;
    photo_url: string;
    username: string;
  };
}
