import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import MicOffOutlinedIcon from '@material-ui/icons/MicOffOutlined';
import MicOutlinedIcon from '@material-ui/icons/MicOutlined';
import React from 'react';

import { IUser } from './interface';

interface Props {
  user?: IUser;
  onClickHowItWorks: () => void;
  onClickVoiceChat: () => void;
  onLogout: () => void;
}

const useStyles = makeStyles(() => ({
  logo: {
    width: '2.5rem',
    verticalAlign: 'middle',
  },
  alpha: {
    color: '#4f4f4f',
    fontStyle: 'italic',
    fontWeight: 400,
  },
}));

export function Title({ user, onClickHowItWorks, onClickVoiceChat, onLogout }: Props) {
  const classes = useStyles();

  return (
    <Grid container spacing={1} alignItems="center" justify="center">
      <Grid item>
        <Typography variant="h1" component="div">
          <img className={classes.logo} src="https://www.joinclubhouse.com/static/img/icon_wave.png" />
          Clubhouse for Web <sup className={classes.alpha}>alpha</sup>
        </Typography>
      </Grid>
      <Grid item>
        <Link href="#" onClick={onClickHowItWorks}>
          How it works?
        </Link>
      </Grid>
      {user && (
        <>
          <Grid item>
            <IconButton
              title={`Voice chat ${user.enabled_voice_chat ? 'enabled' : 'disabled'}`}
              color="inherit"
              onClick={onClickVoiceChat}
            >
              {user.enabled_voice_chat && <MicOutlinedIcon fontSize="inherit" />}
              {!user.enabled_voice_chat && <MicOffOutlinedIcon fontSize="inherit" />}
            </IconButton>
          </Grid>
          <Grid item>
            <Link href="#" onClick={onLogout}>
              Logout
            </Link>
          </Grid>
        </>
      )}
    </Grid>
  );
}
