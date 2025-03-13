// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import App from './SiteWeb/App';
import { theme } from './theme';
import ErrorBoundary from '../ErrorBoundary'; // Assurez-vous que le fichier existe et que le chemin est correct

// jQuery est chargé globalement via index.html ; vous pouvez l'utiliser via window.$
// Si vous avez besoin d'une référence locale, vous pouvez faire :
// const $ = window.$;

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </BrowserRouter>
);
