const path = require('path');
const Sitemap = require('react-router-sitemap').default;
// Importez ou définissez vos routes. Par exemple, si vos routes sont dans src/App.js :
const router = require('./src/App.jsx').default;


function generateSitemap() {
  return (
    new Sitemap(router)
      .build('https://frontendcleservice.onrender.com')
      .save(path.resolve('./public/sitemap.xml'))
  );
}

generateSitemap();

