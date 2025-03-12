import * as React from 'react';
import { red } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#312E8C',
    },
    secondary:{
        main: '#2C2973',
    },
    tricondary:{
        main: '#F6C548',
    },
    quacondary:{
        main: '#A4A6BF',
    },
    cincondary:{
        main: '#F2F2F2F',
    },
    
  },
});
