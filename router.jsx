// router.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const router = (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/trouvez.php" element={<Catalogue />} />
    <Route path="/catalogue-cles-coffre.php" element={<Coffrefort />} />
    <Route path="/catalogue-telecommandes.php" element={<Telecomande />} />
    <Route path="/badges.php" element={<Badgeuu />} />
    <Route path="/services.php" element={<AutreService />} />
    <Route path="/contact.php" element={<Contact />} />
    <Route path="/commande-success" element={<PaymentSuccess />} />
    <Route path="/commande-cancel" element={<PaymentCancel />} />
    <Route path="/dynamic/:brandName" element={<CleDynamicPage />} />
    <Route path="/devis.php" element={<Devis />} />
    <Route path="/qui.php" element={<AboutUs />} />
    <Route path="/commander/:brandName/:articleType/:articleName" element={<CommandePage />} />
    <Route path="/commande-panier" element={<CommandePagePanier />} />
    {/* Ajoutez vos autres routes ici */}
  </Routes>
);

export default router;
