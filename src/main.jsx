import $ from 'jquery';
// Ensuite, vos autres imports
import React from 'react';
import ReactDOM from 'react-dom/client';
// etc.


import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import App from './SiteWeb/App';
import { theme } from './theme';

const Main = () => {
  useEffect(() => {
    // Exemple d'utilisation de jQuery :
    // On fait disparaître l'élément avec l'id "root" puis on le fait apparaître en fondu sur 1 seconde.
    $('#root').hide().fadeIn(1000);
  }, []); // Ce code s'exécute une seule fois au montage du composant

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(<Main />);
