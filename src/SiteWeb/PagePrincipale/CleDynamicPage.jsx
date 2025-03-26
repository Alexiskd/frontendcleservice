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
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { preloadKeysData, preloadBrandsData } from '../brandsApi';

// Marques hardcodées
const hardcodedBrands = [
  { id: 1, manufacturer: 'CLES ASSA' },
  { id: 2, manufacturer: 'CLES BODE' },
  { id: 3, manufacturer: 'CLES CECCHERELLI' },
  { id: 4, manufacturer: 'CLES CIS' },
  { id: 5, manufacturer: 'CLES CONFORTI' },
  { id: 6, manufacturer: 'CLES CORBIN' },
  { id: 7, manufacturer: 'CLES DUTO' },
  { id: 8, manufacturer: 'CLES FASTA' },
  { id: 9, manufacturer: 'CLES FICHET BAUCHE' },
  { id: 10, manufacturer: 'CLES FUMEO-PARMA' },
  { id: 11, manufacturer: 'CLES GLITTENBERG' },
  { id: 12, manufacturer: 'CLES HAGELIN' },
  { id: 13, manufacturer: 'CLES KROMER' },
  { id: 14, manufacturer: 'CLES LIPS-VAGO' },
  { id: 15, manufacturer: 'CLES MAUER' },
  { id: 16, manufacturer: 'CLES MELSMETALL' },
  { id: 17, manufacturer: 'CLES PARMA' },
  { id: 18, manufacturer: 'CLES PARMA-PAS' },
  { id: 19, manufacturer: 'CLES PICARDIE' },
  { id: 20, manufacturer: 'CLES ROSENGREN' },
  { id: 21, manufacturer: 'CLES SECURCASA' },
  { id: 22, manufacturer: 'CLES SELLA & VALZ' },
  { id: 23, manufacturer: 'CLES SIBI' },
  { id: 24, manufacturer: 'CLES STIEHM' },
  { id: 25, manufacturer: 'CLES STUV' },
  { id: 26, manufacturer: 'CLES SWEDEN' },
];

// Hook de debounce pour la saisie utilisateur
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const CleDynamicPage = () => {
  const { brandFull } = useParams();
  const navigate = useNavigate();
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

  // Redirection vers la page produit si le paramètre ressemble à un slug produit
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      const parts = brandFull.split("-");
      if (parts.length >= 3) {
        const brand = parts[0];
        const productName = parts.slice(2).join("-");
        navigate(`/produit/${brand}/${encodeURIComponent(productName)}`);
      } else {
        navigate(`/produit/${encodeURIComponent(brandFull)}`);
      }
      return;
    }
  }, [brandFull, navigate]);

  // Extraction et normalisation du nom de la marque en prenant en compte les deux suffixes possibles
  let actualBrandName = brandFull;
  if (brandFull.endsWith('_1_reproduction_cle.html')) {
    actualBrandName = brandFull.slice(0, -'_1_reproduction_cle.html'.length);
  } else if (brandFull.endsWith('_1_coffre_fort.html')) {
    actualBrandName = brandFull.slice(0, -'_1_coffre_fort.html'.length);
  }
  const adjustedBrandName = actualBrandName.toUpperCase();

  // Détection si c'est une clé de coffre‑fort
  const isCoffreFort = adjustedBrandName.replace(/[-_]/g, ' ').includes("COFFRE FORT");

  // Définition des balises SEO
  const pageTitle = isCoffreFort
    ? "Clés Coffre Fort – Bode Clé Dynamique"
    : `${adjustedBrandName} – Clés et reproductions de qualité`;
  const pageDescription = isCoffreFort
    ? "Découvrez notre sélection exclusive de clés de coffre fort via notre Bode Clé Dynamique."
    : `Découvrez les clés et reproductions authentiques de ${adjustedBrandName}. Commandez directement chez le fabricant ou dans nos ateliers pour bénéficier d'un produit de qualité et d'un service personnalisé.`;

  // Fonction pour obtenir l'URL d'une image
  const getImageSrc = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (!imageUrl.startsWith('http')) return `https://cl-back.onrender.com/${imageUrl}`;
    return imageUrl;
  }, []);

  // Génération des données structurées Schema.org (ItemList)
  const jsonLdData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${adjustedBrandName} – Catalogue de clés`,
    "description": `Catalogue des clés et reproductions pour ${adjustedBrandName}. Commandez en ligne la reproduction de votre clé.`,
    "itemListElement": keys.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.nom,
        "description": item.descriptionNumero || "Clé de reproduction",
        "image": getImageSrc(item.imageUrl),
        "brand": {
          "@type": "Brand",
          "name": item.marque
        },
        "offers": {
          "@type": "Offer",
          "price": item.prix,
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": window.location.href
        }
      }
    }))
  }), [adjustedBrandName, keys, getImageSrc]);

  // Récupération du logo pour la marque
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) return;
    if (!actualBrandName) return;
    fetch(`https://cl-back.onrender.com/brands/logo/${encodeURIComponent(actualBrandName)}`)
      .then((res) => {
        if (res.ok) return res.blob();
        throw new Error(`Logo non trouvé pour ${actualBrandName}`);
      })
      .then((blob) => {
        const logoUrl = URL.createObjectURL(blob);
        setBrandLogo(logoUrl);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du logo:", error);
        setBrandLogo(null);
      });
  }, [actualBrandName, brandFull]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Chargement initial des clés
  useEffect(() => {
    if (/^\d+-/.test(brandFull)) {
      setLoading(false);
      return;
    }
    if (!adjustedBrandName) {
      setError("La marque n'a pas été fournie.");
      setLoading(false);
      return;
    }
    setLoading(true);

    // Si c'est une marque de coffre‑fort, on utilise "COFFRE FORT" comme critère de recherche
    if (isCoffreFort) {
      fetch(`https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent("COFFRE FORT")}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur lors de la récupération des clés pour COFFRE FORT`);
          }
          return res.json();
        })
        .then((data) => {
          setKeys(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des clés:', err);
          setError(err.message);
          setSnackbarMessage(`Erreur: ${err.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
      return;
    }

    // Pour les autres marques, recherche d'une correspondance dans les marques hardcodées
    const matchedHardcoded = hardcodedBrands.find(b =>
      b.manufacturer.toUpperCase().endsWith(adjustedBrandName)
    );

    if (matchedHardcoded) {
      fetch(`https://cl-back.onrender.com/produit/cles?marque=${encodeURIComponent(matchedHardcoded.manufacturer)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur lors de la récupération des clés pour ${matchedHardcoded.manufacturer}`);
          }
          return res.json();
        })
        .then((data) => {
          setKeys(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des clés:', err);
          setError(err.message);
          setSnackbarMessage(`Erreur: ${err.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    } else {
      // Pour les marques non hardcodées (hors coffre‑fort), on utilise les données préchargées
      const levenshteinDistance = (a, b) => {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };

      preloadBrandsData()
        .then((brands) => {
          if (!brands || brands.length === 0) {
            throw new Error("Aucune marque préchargée.");
          }
          let bestBrand = brands[0];
          let bestDistance = levenshteinDistance(bestBrand.nom, adjustedBrandName);
          brands.forEach((brand) => {
            const distance = levenshteinDistance(brand.nom, adjustedBrandName);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestBrand = brand;
            }
          });
          return preloadKeysData(bestBrand.nom);
        })
        .then((data) => {
          setKeys(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des clés:', err);
          setError(err.message);
          setSnackbarMessage(`Erreur: ${err.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [adjustedBrandName, brandFull, isCoffreFort]);

  // Préchargement des images des clés
  useEffect(() => {
    keys.forEach((item) => {
      const img = new Image();
      img.src = getImageSrc(item.imageUrl);
    });
  }, [keys, getImageSrc]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Tri personnalisé
  const sortedKeys = useMemo(() => {
    const filtered = keys.filter((item) =>
      item.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      const aHasPostal = Number(a.prixSansCartePropriete) > 0;
      const bHasPostal = Number(b.prixSansCartePropriete) > 0;
      if (aHasPostal && !bHasPostal) return -1;
      if (!aHasPostal && bHasPostal) return 1;
      return b.id - a.id;
    });
    return filtered;
  }, [keys, debouncedSearchTerm]);

  // Redirection vers la page de commande
  const handleOrderNow = useCallback((item, mode) => {
    try {
      const formattedName = item.nom.trim().replace(/\s+/g, '-');
      navigate(`/commander/${adjustedBrandName.replace(/\s+/g, '-')}/cle/${item.referenceEbauche}/${encodeURIComponent(formattedName)}?mode=${mode}`);
    } catch (error) {
      console.error('Erreur lors de la navigation vers la commande:', error);
      setSnackbarMessage(`Erreur lors de la commande: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [adjustedBrandName, navigate]);

  // Redirection vers la page
