// server.js
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App.js'; // Assurez-vous que App.js est dans le même dossier

const app = express();

// Sert les fichiers statiques (build, CSS, images, etc.)
app.use(express.static('build'));

app.get('*', (req, res) => {
  // On utilise React.createElement pour éviter d'utiliser directement JSX
  const appHtml = ReactDOMServer.renderToString(React.createElement(App));
  
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
