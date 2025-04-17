import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [openCgvDialog, setOpenCgvDialog] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = (img) =>
    img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://cl-back.onrender.com/commande/paid', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Erreur (status ${response.status})`);
      const json = await response.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => socket.off('commandeUpdate');
  }, []);

  const openCancelDialog = (commande) => {
    setCommandeToCancel(commande);
    setCancellationReason('');
    setOpenDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!commandeToCancel || !cancellationReason.trim()) {
      alert("Veuillez saisir une raison d'annulation.");
      return;
    }
    try {
      const resp = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      const data = await resp.json();
      alert(data.success ? 'Commande annulée avec succès.' : 'Erreur lors de l\'annulation.');
      fetchCommandes();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'annulation.');
    } finally {
      setOpenDialog(false);
      setCommandeToCancel(null);
      setCancellationReason('');
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const handleCgvOpen = () => setOpenCgvDialog(true);
  const handleCgvClose = () => setOpenCgvDialog(false);

  const sorted = [...commandes].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <Container maxWidth="lg" sx={{ py: 4, fontFamily: '"Poppins", sans-serif', backgroundColor: 'rgba(240,255,245,0.5)' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: 'green.700', fontWeight: 600 }}>
        Détails des Commandes Payées
      </Typography>

      {/* Bouton pour ouvrir les CGV */}
      <Box textAlign="center" mb={3}>
        <Button variant="outlined" onClick={handleCgvOpen}>
          Conditions Générales de Vente
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="success" />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {!loading && sorted.length === 0 && !error && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}

      <Grid container spacing={3}>
        {sorted.map((c) => (
          <Grid item xs={12} key={c.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'green.100', overflow: 'hidden' }}>
              <CardContent sx={{ backgroundColor: 'white' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>Produit Commandé :</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography>{Array.isArray(c.cle) ? c.cle.join(', ') : c.cle || 'Non renseigné'}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>Informations Client :</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'green.800' }}>{c.nom}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>Numéro de commande : {c.numeroCommande || 'Non renseigné'}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>Date de commande : {c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : 'Non renseignée'}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocationOnIcon sx={{ color: 'green.500', mr: 1 }} />
                    <Typography>{c.adressePostale.split(',')[0].trim()}</Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', backgroundColor: 'green.50', p: 2 }}>
                <Button variant="contained" color="primary" onClick={() => window.open(generateInvoiceDoc(c).output('dataurlnewwindow'), '_blank')}>Afficher Facture</Button>
                <Button variant="contained" color="secondary" onClick={() => generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`)}>Télécharger Facture</Button>
                <Button variant="contained" color="info" onClick={() => { const d = generateInvoiceDoc(c); d.autoPrint(); window.open(d.output('bloburl'), '_blank'); }}>Imprimer Facture</Button>
                <Button variant="contained" startIcon={<CancelIcon />} sx={{ borderRadius: 20, backgroundColor: 'red.400', '&:hover': { backgroundColor: 'red.600' } }} onClick={() => openCancelDialog(c)}>Annuler la commande</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogue d'annulation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen={fullScreen} PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: 'green.50' } }}>
        <DialogTitle sx={{ fontWeight: 600, color: 'green.800' }}>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Raison de l'annulation" fullWidth variant="outlined" value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="success">Annuler</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={!cancellationReason.trim()}>Confirmer l'annulation</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue CGV */}
      <Dialog open={openCgvDialog} onClose={handleCgvClose} fullScreen={fullScreen} PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle>Conditions Générales de Vente</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Objet</Typography>
          <Typography paragraph>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client souhaitant effectuer un achat sur le site cleservice.com (ci-après "l'Acheteur").</Typography>
          <Typography variant="h6" gutterBottom>Produits</Typography>
          <Typography paragraph>Les produits proposés à la vente sont présentés avec la plus grande exactitude possible. En cas d'erreur ou d'omission, le Vendeur se réserve le droit de corriger les informations sans que cela n'engage sa responsabilité.</Typography>
          <Typography variant="h6" gutterBottom>Prix</Typography>
          <Typography paragraph>Les prix indiqués sur le site sont exprimés en euros, toutes taxes comprises (TTC) et peuvent être modifiés à tout moment. Le prix applicable à l'achat est celui en vigueur au moment de la validation de la commande.</Typography>
          <Typography variant="h6" gutterBottom>Commande</Typography>
          <Typography paragraph>Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV. L'Acheteur déclare avoir pris connaissance de ces conditions avant de valider sa commande.</Typography>
          <Typography variant="h6" gutterBottom>Paiement</Typography>
          <Typography paragraph>Le paiement s'effectue en ligne par carte bancaire ou via d'autres moyens de paiement proposés sur le site. Le Vendeur garantit la sécurité des transactions.</Typography>
          <Typography variant="h6" gutterBottom>Livraison</Typography>
          <Typography paragraph>Les produits sont livrés à l'adresse indiquée par l'Acheteur lors de la commande. Les délais de livraison, précisés sur le site, peuvent varier en fonction de la destination. Tout retard ne pourra être imputé au Vendeur.</Typography>
          <Typography variant="h6" gutterBottom>Droit de Rétractation</Typography>
          <Typography paragraph>Conformément à la législation en vigueur, l'Acheteur dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs. Les frais de retour sont à la charge de l'Acheteur, sauf indication contraire.</Typography>
          <Typography variant="h6" gutterBottom>Garantie</Typography>
          <Typography paragraph>Les produits vendus bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés, conformément aux dispositions légales en vigueur.</Typography>
          <Typography variant="h6" gutterBottom>Responsabilité</Typography>
          <Typography paragraph>Le Vendeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation des produits. La responsabilité du Vendeur est limitée au montant de la commande.</Typography>
          <Typography variant="h6" gutterBottom>Droit Applicable et Juridiction</Typography>
          <Typography paragraph>Les présentes CGV sont régies par le droit français. En cas de litige, seuls les tribunaux de Paris seront compétents, sauf disposition légale contraire.</Typography>
          <Typography variant="h6" gutterBottom>Modification des CGV</Typography>
          <Typography paragraph>Le Vendeur se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment. Les modifications seront publiées sur le site et s'appliqueront à toutes les commandes passées après leur mise en ligne.</Typography>
          <Typography paragraph>© 2025 cleservice.com - Tous droits réservés.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCgvClose} color="primary">Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue Image */}
      <Dialog open={openImageDialog} onClose={() => { setOpenImageDialog(false); setZoom(1); }} fullScreen={fullScreen} maxWidth="lg" fullWidth onWheel={handleWheel} sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '90vh', overflow: 'hidden' }}>
        <DialogActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => { setOpenImageDialog(false); setZoom(1); }}><CloseIcon /></IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage && (<Box component="img" src={decodeImage(selectedImage)} alt="Enlargi" sx={{ maxWidth: '100%', maxHeight: '80vh', transform: `scale(${zoom})`, transition: 'transform 0.2s', transformOrigin: 'center', borderRadius: 2 }} />)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
