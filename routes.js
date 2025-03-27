// routes.js
// Ce fichier exporte une liste d'objets représentant les routes publiques de l'application.
// Chaque objet contient :
// - url : le chemin de la page
// - changefreq : la fréquence de mise à jour estimée (daily, weekly, monthly, etc.)
// - priority : la priorité de la page pour l'indexation (entre 0.0 et 1.0)

module.exports = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/index.php', changefreq: 'daily', priority: 0.9 },
    { url: '/trouvez.php', changefreq: 'weekly', priority: 0.8 },
    { url: '/catalogue-cles-coffre.php', changefreq: 'weekly', priority: 0.8 },
    { url: '/catalogue-telecommandes.php', changefreq: 'weekly', priority: 0.8 },
    { url: '/badges.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/services.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/cle/double-de-cle.html', changefreq: 'monthly', priority: 0.7 },
    { url: '/zone.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/paiement_devis.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/recherche.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact.php', changefreq: 'monthly', priority: 0.8 },
    { url: '/commande-success', changefreq: 'monthly', priority: 0.7 },
    { url: '/commande-cancel', changefreq: 'monthly', priority: 0.7 },
    // Route dynamique pouvant rediriger vers des pages spécifiques selon la marque
    { url: '/:brandFull', changefreq: 'daily', priority: 0.8 },
    { url: '/devis.php', changefreq: 'monthly', priority: 0.7 },
    { url: '/qui.php', changefreq: 'monthly', priority: 0.7 },
    // Route comportant plusieurs paramètres pour la commande
    { url: '/commander/:brandName/cle/:referenceEbauche/:articleName', changefreq: 'weekly', priority: 0.8 },
    { url: '/commande-panier', changefreq: 'weekly', priority: 0.8 },
    { url: '/upload-multiple', changefreq: 'weekly', priority: 0.6 },
    { url: '/politique-confidentialite', changefreq: 'monthly', priority: 0.6 },
    { url: '/mentions-legales', changefreq: 'monthly', priority: 0.6 },
    { url: '/conditions-generales', changefreq: 'monthly', priority: 0.6 },
    // Route produit avec paramètres
    { url: '/produit/:brandName/:productName', changefreq: 'weekly', priority: 0.8 },
  ];
  