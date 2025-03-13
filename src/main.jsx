// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import App from './SiteWeb/App';
import { theme } from './theme';
import ErrorBoundary from './ErrorBoundary.jsx'; // Chemin relatif vérifié

// jQuery est chargé globalement via index.html (accessible via window.$)
// Si besoin : const $ = window.$;

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
