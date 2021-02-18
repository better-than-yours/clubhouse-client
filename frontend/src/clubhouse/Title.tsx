import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

import { IUser } from './interface';

interface Props {
  user?: IUser;
  onClickHowItWorks: () => void;
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

export function Title({ user, onClickHowItWorks, onLogout }: Props) {
  const classes = useStyles();
  return (
    <Grid container spacing={5} alignItems="center" justify="center">
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
        <Grid item>
          <Link href="#" onClick={onLogout}>
            Logout
          </Link>
        </Grid>
      )}
    </Grid>
  );
}
