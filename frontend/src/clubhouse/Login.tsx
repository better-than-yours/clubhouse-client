import React, { useState } from 'react';
import { FormControl, InputLabel, Input, Grid, Button } from '@material-ui/core';
import { ILogin, IUser } from './interface';
import { doStartPhoneNumberAuth, doCompletePhoneNumberAuth } from './request';

interface Params {
  onUpdateUser: (user: IUser) => void;
}

export function Login({ onUpdateUser: onSetUser }: Params) {
  const [login, setLogin] = useState<ILogin>({
    phone_number: '',
  });

  async function handleSubmit() {
    if (login.verification_code) {
      const response = await doCompletePhoneNumberAuth({
        phone_number: login.phone_number,
        verification_code: login.verification_code,
      });
      onSetUser({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_profile: response.user_profile,
      });
    } else {
      await doStartPhoneNumberAuth({ phone_number: login.phone_number });
    }
  }

  function handleChangeLogin(values: Partial<ILogin>) {
    setLogin({ ...login, ...values });
  }

  return (
    <Grid item xs={3}>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="phone-number-input">Phone number</InputLabel>
            <Input
              id="phone-number-input"
              onChange={(event) =>
                handleChangeLogin({
                  phone_number: event.target.value,
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="verification-code-input">Verification code</InputLabel>
            <Input
              id="verification-code-input"
              onChange={(event) =>
                handleChangeLogin({
                  verification_code: event.target.value,
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Login
            </Button>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
}
