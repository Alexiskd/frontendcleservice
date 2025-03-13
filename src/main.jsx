// index.js ou App.jsx (avant le rendu React)
import $ from 'https://code.jquery.com/jquery-3.6.0.min.js';

window.$ = window.jQuery = $;


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import App from './SiteWeb/App';
import { theme } from './theme';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("L'élément racine n'a pas été trouvé");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}
