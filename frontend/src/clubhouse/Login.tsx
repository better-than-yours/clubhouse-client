import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useState } from 'react';

import { ILogin, IUser } from './interface';
import { doCompletePhoneNumberAuth, doStartPhoneNumberAuth } from './request';

interface Props {
  onUpdateUser: (user: IUser) => void;
}

export function Login({ onUpdateUser }: Props) {
  const [login, setLogin] = useState<ILogin>({
    phone_number: '',
  });

  async function handleSubmit() {
    if (login.verification_code) {
      const response = await doCompletePhoneNumberAuth({
        phone_number: login.phone_number,
        verification_code: login.verification_code,
      });
      onUpdateUser({
        token: response.auth_token,
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
