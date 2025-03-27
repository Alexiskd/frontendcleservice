const fs = require('fs');
const path = require('path');
const routes = require('./routes.js');

const baseUrl = 'http://cleservice.com';
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" `;
sitemapXml += `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" `;
sitemapXml += `xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 `;
sitemapXml += `http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

routes.forEach(route => {
  sitemapXml += `  <url>\n`;
  sitemapXml += `    <loc>${route.loc}</loc>\n`;
  sitemapXml += `    <changefreq>${route.changefreq}</changefreq>\n`;
  sitemapXml += `    <priority>${route.priority}</priority>\n`;
  sitemapXml += `  </url>\n`;
});

sitemapXml += `</urlset>`;

fs.writeFileSync(path.resolve(__dirname, 'public/sitemap.xml'), sitemapXml, 'utf8');
console.log('Sitemap généré avec succès.');
