#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Importation du module routes
const routesImport = require('./routes.js');
// Si routesImport possède une propriété 'default', on l'utilise, sinon on utilise directement routesImport.
const routes = routesImport.default || routesImport;

if (!Array.isArray(routes)) {
  console.error("Erreur : la variable 'routes' n'est pas un tableau.");
  process.exit(1);
}

// Construction du sitemap au format XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

routes.forEach(route => {
  sitemap += `  <url>\n`;
  sitemap += `    <loc>https://cleservice.com${route.url}</loc>\n`;
  sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
  sitemap += `    <priority>${route.priority}</priority>\n`;
  sitemap += `  </url>\n`;
});

sitemap += `</urlset>`;

// Enregistrement du sitemap dans le dossier dist
fs.writeFileSync(path.join(__dirname, 'dist', 'sitemap.xml'), sitemap);
console.log("Sitemap généré avec succès !");
