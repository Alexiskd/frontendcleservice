// server.js
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './src/App.js'; // Votre composant racine React

const app = express();

// Servir les fichiers statiques générés (JS, CSS, images, etc.)
app.use(express.static('build'));

// Pour toutes les requêtes, générer le HTML complet
app.get('*', (req, res) => {
  // Rendu de l'application en chaîne de caractères
  const appHtml = ReactDOMServer.renderToString(<App />);
  
  // Créer le HTML complet à envoyer
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Mon site React SSR</title>
        <meta name="description" content="Description de mon site pour le SEO." />
        <link rel="canonical" href="https://www.cleservice.com" />
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script src="/static/js/main.js"></script>
      </body>
    </html>
  `;
  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
