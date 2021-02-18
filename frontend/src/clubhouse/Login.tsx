import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Alert from '@material-ui/lab/Alert';
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
  const [requestedCode, setRequestedCode] = useState(false);

  async function handleSubmit() {
    if (requestedCode) {
      if (login.verification_code) {
        const response = await doCompletePhoneNumberAuth({
          phone_number: login.phone_number,
          verification_code: login.verification_code,
        });
        onUpdateUser({
          token: response.auth_token,
          user_profile: response.user_profile,
        });
      }
    } else {
      await doStartPhoneNumberAuth({ phone_number: login.phone_number });
      setRequestedCode(true);
    }
  }

  function handleChangeLogin(values: Partial<ILogin>) {
    setLogin({ ...login, ...values });
  }

  return (
    <Grid container spacing={5} alignItems="center" justify="center" direction="column" style={{ minHeight: '100vh' }}>
      <Grid item>
        <Alert variant="outlined" severity="info">
          We don't store your personal data on our servers!
        </Alert>
      </Grid>
      <Grid item>
        <Grid container spacing={1} direction="row">
          {!requestedCode && (
            <Grid item>
              <FormControl fullWidth={true}>
                <InputLabel htmlFor="phone-number-input">Enter your phone #</InputLabel>
                <Input
                  id="phone-number-input"
                  placeholder="+12345678900"
                  onChange={(event) =>
                    handleChangeLogin({
                      phone_number: event.target.value,
                    })
                  }
                />
              </FormControl>
            </Grid>
          )}
          {requestedCode && (
            <Grid item>
              <FormControl fullWidth={true}>
                <InputLabel htmlFor="verification-code-input">Enter the code</InputLabel>
                <Input
                  id="verification-code-input"
                  placeholder="1234"
                  onChange={(event) =>
                    handleChangeLogin({
                      verification_code: event.target.value,
                    })
                  }
                />
              </FormControl>
            </Grid>
          )}
          <Grid item>
            <FormControl>
              <Button variant="outlined" color="primary" onClick={handleSubmit}>
                Next
              </Button>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
