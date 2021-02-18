import Grid from '@material-ui/core/Grid';
import { ThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import React from 'react';

import { Client } from './clubhouse/Client';
const theme = createMuiTheme({
  typography: {
    fontFamily: '"Nunito", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: '#333',
    },
    body1: {
      fontWeight: 700,
      fontSize: '1rem',
    },
    body2: {
      fontSize: '.875rem',
      color: '#4f4f4f',
    },
    caption: {
      fontWeight: 700,
      fontSize: '.875rem',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Grid container justify="center" alignItems="center">
        <Client />
      </Grid>
    </ThemeProvider>
  );
}

export default App;
