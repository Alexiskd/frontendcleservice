// server.js
const express = require('express');
const app = express();

// Middleware pour parser les corps de requête en JSON
app.use(express.json());

// Endpoint principal pour récupérer une clé par marque et référence
app.get('/produit/cles/by-brand-ref', (req, res) => {
  const { brand, reference, name, mode } = req.query;

  // Vérification de la présence des paramètres requis
  if (!brand || !reference || !name || !mode) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  // Ici, on simule la récupération d'une donnée. Remplacez cette logique par l'accès à votre base de données.
  if (brand === "abus" && reference === "XP-1" && name === "Clé-Abus-XP-1" && mode === "numero") {
    return res.status(200).json({ key: "valeurDeLaClePrincipale" });
  } else {
    return res.status(404).json({ error: "Clé non trouvée pour les paramètres fournis." });
  }
});

// Endpoint fallback pour récupérer la clé la plus proche
app.get('/cles/closest', (req, res) => {
  const { nom } = req.query;

  if (!nom) {
    return res.status(400).json({ error: "Le paramètre 'nom' est requis." });
  }

  // Logique de fallback pour retrouver une clé proche
  if (nom === "Clé-Abus-XP-1") {
    return res.status(200).json({ key: "valeurDeLaCleFallback" });
  } else {
    return res.status(404).json({ error: "Aucune clé de fallback trouvée pour le nom donné." });
  }
});

// Configuration du serveur et de Socket.IO (si besoin de connexion en temps réel)
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" } // Ajustez la configuration CORS selon votre environnement de production
});

io.on('connection', (socket) => {
  console.log("Nouvelle connexion Socket.IO :", socket.id);
  // Gestion des événements Socket.IO
  socket.on('disconnect', () => {
    console.log("Déconnexion :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});


