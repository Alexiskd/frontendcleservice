import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet';
import { Box, CircularProgress } from '@mui/material';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import styled from 'styled-components';

import Header from "./appbar.jsx";
import Footer from './PagePrincipale/footer.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { DataProvider } from './PagePrincipale/DataContext.jsx';
import ProductPage from './PagePrincipale/ProductPage.jsx';
import { preloadBrandsData, preloadKeysData } from './brandsApi';

// Composantes Admin (lazy loading)
const Barreadmin = lazy(() => import('../AppAdmin/barreadmin.jsx'));
const Ajoutez = lazy(() => import('../AppAdmin/ajoutez.jsx'));
const Commande = lazy(() => import('../AppAdmin/commande.jsx'));
const Messages = lazy(() => import('../AppAdmin/Messages.jsx'));
const Loginside = lazy(() => import('../AppAdmin/loginside.jsx'));
const MarqueAdmin = lazy(() => import('../AppAdmin/MarqueAdmin.jsx'));
const StatistiquesCommandes = lazy(() => import('../AppAdmin/stat.jsx'));

// Pages utilisateurs (lazy loading)
const CommandePagePanier = lazy(() => import('./PagePrincipale/commandePagePanier.jsx'));
const Login = lazy(() => import("../SiteWeb/HomePage.jsx"));
import Catalogue from "./PagePrincipale/catologue.jsx";
const CleDynamicPage = lazy(() => import("./PagePrincipale/CleDynamicPage.jsx"));
const Coffrefort = lazy(() => import('./PagePrincipale/coffrefort.jsx'));
const Telecommande = lazy(() => import('./PagePrincipale/telecommande.jsx'));
const Badgeuu = lazy(() => import('./PagePrincipale/badge.jsx'));
const ServiceRedirect = lazy(() => import('./PagePrincipale/serviceredirect.jsx'));
const Contact = lazy(() => import('./PagePrincipale/contact.jsx'));
const Devis = lazy(() => import('./UserPA/devis.jsx'));
const TutorialPopup = lazy(() => import('./PagePrincipale/tuto.jsx'));
const AboutUs = lazy(() => import('./PagePrincipale/aboutus.jsx'));
const CommandePage = lazy(() => import('./PagePrincipale/commandePage.jsx'));
const PaymentSuccess = lazy(() => import('./PagePrincipale/PaymentSuccess.jsx'));
const PaymentCancel = lazy(() => import('./PagePrincipale/PaymentCancel.jsx'));
const MultiImageUploader = lazy(() => import('../AppAdmin/multi.jsx'));
const PolitiqueConfidentialite = lazy(() => import('./PagePrincipale/politique.jsx'));
const MentionsLegales = lazy(() => import('./PagePrincipale/mentionlegal.jsx'));
const ConditionsGeneralesDeVente = lazy(() => import('./PagePrincipale/conditiongene.jsx'));

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const ProtectedRouteWrapper = ({ children }) => {
  const isAuthenticated = () => !!localStorage.getItem('token');
  return isAuthenticated() ? children : <Navigate to="/app" />;
};

const App = () => {
  const location = useLocation();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (
      location.pathname === '/trouvez.php' ||
      location.pathname === '/catalogue-cles-coffre.php'
    ) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [location]);

  const handleCloseTutorial = () => setShowTutorial(false);
  const isAppRoute = location.pathname.startsWith('/app');

  // Préchargement immédiat des modules lazy (sans keysearch.jsx)
  useEffect(() => {
    import("./PagePrincipale/CleDynamicPage.jsx");
    import("../AppAdmin/barreadmin.jsx");
    import("../AppAdmin/ajoutez.jsx");
    import("../AppAdmin/commande.jsx");
    import("../AppAdmin/Messages.jsx");
    import("../AppAdmin/loginside.jsx");
    import("../AppAdmin/MarqueAdmin.jsx");
    import("../AppAdmin/stat.jsx");
    import("./PagePrincipale/commandePagePanier.jsx");
    import("./PagePrincipale/coffrefort.jsx");
    import("./PagePrincipale/telecommande.jsx");
    import("./PagePrincipale/badge.jsx");
    import("./PagePrincipale/serviceredirect.jsx");
    import("./PagePrincipale/contact.jsx");
    import("./UserPA/devis.jsx");
    import("./PagePrincipale/tuto.jsx");
    import("./PagePrincipale/aboutus.jsx");
    import("./PagePrincipale/commandePage.jsx");
    import("./PagePrincipale/PaymentSuccess.jsx");
    import("./PagePrincipale/PaymentCancel.jsx");
    import("../AppAdmin/multi.jsx");
    import("./PagePrincipale/politique.jsx");
    import("./PagePrincipale/mentionlegal.jsx");
    import("./PagePrincipale/conditiongene.jsx");
  }, []);

  // Préchargement des données hors admin
  useEffect(() => {
    if (!location.pathname.startsWith('/app')) {
      preloadBrandsData()
        .then((brandsData) => {
          console.log("Marques préchargées :", brandsData);
          brandsData.forEach((brand) => {
            preloadKeysData(brand.nom)
              .then((keysData) => {
                console.log(`Clés préchargées pour ${brand.nom} :`, keysData);
              })
              .catch((err) =>
                console.error(`Erreur lors du préchargement des clés pour ${brand.nom} :`, err)
              );
          });
        })
        .catch((err) => console.error("Erreur lors du préchargement des marques :", err));
    }
  }, [location.pathname]);

  return (
    <CartProvider>
      <DataProvider>
        <>
          <Helmet>
            {/* Métadonnées */}
          </Helmet>
          <noscript>
            <div style={{ padding: '1rem', textAlign: 'center', background: '#f8d7da', color: '#721c24' }}>
              Cette application fonctionne mieux avec JavaScript activé.
            </div>
          </noscript>
          <AppContainer className="app">
            {!isAppRoute && <Header />}
            {showTutorial && (
              <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>Chargement du tutoriel...</div>}>
                <TutorialPopup onClose={handleCloseTutorial} />
              </Suspense>
            )}
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <CircularProgress />
              </Box>
            }>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Login />} />
                <Route path="/index.php" element={<Login />} />
                <Route path="/trouvez.php" element={<Catalogue />} />
                <Route path="/catalogue-cles-coffre.php" element={<Coffrefort />} />
                <Route path="/catalogue-telecommandes.php" element={<Telecommande />} />
                <Route path="/badges.php" element={<Badgeuu />} />
                <Route path="/services.php" element={<ServiceRedirect />} />
                <Route path="/cle/double-de-cle.html" element={<ServiceRedirect />} />
                <Route path="/zone.php" element={<ServiceRedirect />} />
                <Route path="/paiement_devis.php" element={<ServiceRedirect />} />
                <Route path="/recherche.php" element={<ServiceRedirect />} />
                <Route path="/contact.php" element={<Contact />} />
                <Route path="/commande-success" element={<PaymentSuccess />} />
                <Route path="/commande-cancel" element={<PaymentCancel />} />
                <Route path="/:brandFull" element={<CleDynamicPage />} />
                <Route path="/devis.php" element={<Devis />} />
                <Route path="/qui.php" element={<AboutUs />} />
                <Route path="/commander/:brandName/cle/:referenceEbauche/:articleName" element={<CommandePage />} />
                <Route path="/commande-panier" element={<CommandePagePanier />} />
                <Route path="/upload-multiple" element={<MultiImageUploader />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/conditions-generales" element={<ConditionsGeneralesDeVente />} />
                {/* Nouvelle route produit avec 3 paramètres */}
                <Route path="/produit/:brandName/:productName" element={<ProductPage />} />
                {/* Nouvelle route '/cle-izis-cassee.php' affichant la composante ProductPage */}
                <Route path="/cle-izis-cassee.php" element={<ProductPage />} />
                
                {/* Routes Admin protégées */}
                <Route
                  path="/app/admin/*"
                  element={
                    <ProtectedRouteWrapper>
                      <Box sx={{ display: 'flex' }}>
                        <Suspense fallback={<div>Chargement de l'administration...</div>}>
                          <Barreadmin />
                        </Suspense>
                        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, ml: '240px' }}>
                          <Suspense fallback={<div>Chargement...</div>}>
                            <Routes>
                              <Route path="ajouter" element={<Ajoutez />} />
                              <Route path="commande" element={<Commande />} />
                              <Route path="statistiques" element={<StatistiquesCommandes />} />
                              <Route path="messages" element={<Messages />} />
                              <Route path="marque" element={<MarqueAdmin />} />
                            </Routes>
                          </Suspense>
                        </Box>
                      </Box>
                    </ProtectedRouteWrapper>
                  }
                />
                <Route path="/app" element={<Loginside />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            {!isAppRoute && <Footer />}
          </AppContainer>
        </>
      </DataProvider>
    </CartProvider>
  );
};

export default App;
