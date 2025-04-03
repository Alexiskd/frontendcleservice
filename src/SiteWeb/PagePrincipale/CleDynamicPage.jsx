 import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Grid,
  Dialog,
  DialogContent
} from '@mui/material';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { preloadKeysData } from '../brandsApi';

// --- Utilitaires identiques ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function normalizeString(str) {
  return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatBrandName(name) {
  if (!name) return "";
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// --- Composante CleDynamicPage ---
const CleDynamicPage = () => {
  const { brandFull, brandName } = useParams();
  const navigate = useNavigate();

  // Utilise brandName s'il est présent, sinon brandFull
  const currentParam = brandName || brandFull;
  if (currentParam && normalizeString(currentParam) === normalizeString("Clé Izis Cavers Reparation de clé")) {
    return <Navigate to="/cle-izis-cassee.php" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [brandLogo, setBrandLogo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [scale, setScale] = useState(1);

  // Si le paramètre ressemble à un slug produit (commence par un chiffre suivi d'un tiret)
  useEffect(() => {
    const param = brandFull || brandName;
    if (/^\d+-/.test(param)) {
      const parts = param.split("-");
      if (parts.length >= 3) {
        const brand = parts[0];
        const productName = parts.slice(2).join("-");
        navigate(/produit/${brand}/${encodeURIComponent(productName)});
      } else {
        navigate(/produit/${encodeURIComponent(param)});
      }
      return;
    }
  }, [brandFull, brandName, navigate]);

  // --- Extraction du nom de la marque ---
  // Pour les URL du type "cle-coffre-fort-corbin.php", on retire le préfixe
  const suffix = '_1_reproduction_cle.html';
  let actualBrandName = "";
  if (brandName) {
    actualBrandName = brandName;
  } else if (brandFull) {
    // Si brandFull commence par "cle-coffre-fort-" (ou variantes avec tiret, underscore ou espace)
    if (/^cle[-_ ]coffre[-_ ]fort[-_ ]/i.test(brandFull)) {
      actualBrandName = brandFull.replace(/^cle[-_ ]coffre[-_ ]fort[-_ ]/i, "");
      // Retire l'extension .php s'il est présent
      actualBrandName = actualBrandName.replace(/\.php$/i, "");
    } else if (brandFull.endsWith(suffix)) {
      actualBrandName = brandFull.slice(0, -suffix.length);
    } else {
      actualBrandName = brandFull;
    }
  }
  const adjustedBrandName = actualBrandName ? formatBrandName(actualBrandName) : "";

  // ... (le reste du composant reste inchangé)
  
  // Exemple de balises SEO utilisant adjustedBrandName
  const pageTitle = ${adjustedBrandName} – Clés et reproductions de qualité;
  const pageDescription = Découvrez les clés et reproductions authentiques de ${adjustedBrandName}.;

  // (Les autres parties du code – chargement des clés, gestion des commandes, etc. – restent identiques)
  
  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {/* Autres méta-données */}
      </Helmet>
      <Box>
        {/* Interface utilisateur (recherche, affichage des clés, etc.) */}
      </Box>
    </HelmetProvider>
  );
};

export default CleDynamicPage;
