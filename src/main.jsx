<<<<<<< HEAD
// index.js ou App.jsx (avant le rendu React)
import $ from 'https://code.jquery.com/jquery-3.6.0.min.js';

window.$ = window.jQuery = $;


=======
>>>>>>> parent of 4e36a80 (Votre message de commit)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import App from './SiteWeb/App';
import { theme } from './theme';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
