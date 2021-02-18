import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

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

export function Title() {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" justify="center">
      <Typography variant="h1" component="div">
        <img className={classes.logo} src="https://www.joinclubhouse.com/static/img/icon_wave.png" />
        Clubhouse for Web <sup className={classes.alpha}>alpha</sup>
      </Typography>
    </Grid>
  );
}
