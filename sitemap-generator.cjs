// Utiliser require pour importer les modules en CommonJS
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

// Définir l'URL de base de votre site
const baseUrl = 'https://votre-site.com';

// Liste des URL à inclure dans le sitemap
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  // Ajoutez d'autres routes selon vos besoins
];

// Créer un flux de sitemap
const sitemapStream = new SitemapStream({ hostname: baseUrl });
const writeStream = createWriteStream('./dist/sitemap.xml');

// Pipeline : écrire dans le fichier sitemap.xml
sitemapStream.pipe(writeStream);

// Ajouter chaque lien au flux
links.forEach(link => sitemapStream.write(link));

// Terminer le flux
sitemapStream.end();

// Une fois le flux terminé, afficher un message
streamToPromise(sitemapStream)
  .then(() => console.log('Sitemap généré avec succès dans le dossier dist !'))
  .catch(err => console.error('Erreur lors de la génération du sitemap:', err));
