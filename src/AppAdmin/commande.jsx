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
  FormControlLabel,
  Checkbox,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  // États pour l'édition d'une commande
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    nom: '',
    ville: '',
    isCleAPasse: false,
    hasCartePropriete: true,
    attestationPropriete: false,
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = (img) =>
    img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://cl-back.onrender.com/commande/paid', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération (status ${response.status})`);
      }
      const json = await response.json();
      if (json && Array.isArray(json.data)) {
        setCommandes(json.data);
      } else {
        setCommandes([]);
      }
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes :', err);
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', () => {
      fetchCommandes();
    });
    return () => {
      socket.off('commandeUpdate');
    };
  }, []);

  const openCancelDialogFor = (commande) => {
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
      const response = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation (status ${response.status})`);
      }
      const data = await response.json();
      alert(data?.success ? "Commande annulée avec succès." : "Erreur lors de l'annulation de la commande.");
      fetchCommandes();
    } catch (err) {
      console.error("Erreur lors de l'annulation de la commande :", err);
      alert("Erreur lors de l'annulation de la commande.");
    } finally {
      setOpenDialog(false);
      setCommandeToCancel(null);
      setCancellationReason('');
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const openEdit = (commande) => {
    setEditFormData({
      id: commande.id,
      nom: commande.nom || '',
      ville: commande.ville || '',
      isCleAPasse: commande.isCleAPasse || false,
      hasCartePropriete: commande.hasCartePropriete !== undefined ? commande.hasCartePropriete : true,
      attestationPropriete: commande.attestationPropriete || false,
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`https://cl-back.onrender.com/commande/update/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la commande');
      }
      alert('Commande mise à jour avec succès');
      setOpenEditDialog(false);
      fetchCommandes();
    } catch (error) {
      alert(error.message);
    }
  };

  const generateInvoiceDoc = (commande) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    doc.setFillColor(27, 94, 32);
    doc.rect(0, margin, 210, 40, 'F');
    doc.addImage(logo, 'PNG', margin, margin, 32, 32);
    doc.setFontSize(8).setTextColor(255, 255, 255);
    doc.text(
      ["MAISON BOUVET", "20 rue de Lévis", "75017 Paris", "Tél : 01 42 67 47 28", "contact@cleservice.com"],
      margin + 37,
      margin + 12,
      { lineHeightFactor: 1.5 }
    );

    const rightX = 210 - margin;
    doc.setTextColor(0).setFontSize(8);
    [commande.nom, commande.adressePostale, `Tél : ${commande.telephone}`, `Email : ${commande.adresseMail}`]
      .filter(Boolean)
      .forEach((t, i) =>
        doc.text(t, rightX, margin + 17 + i * 5, { align: 'right' })
      );

    let currentY = margin + 45;
    const prix = parseFloat(commande.prix);
    const port = commande.shippingMethod === 'expedition' ? 8 : 0;

    doc.autoTable({
      startY: currentY,
      head: [['Produit', 'Quantité', 'Prix Unitaire', 'Frais de port', 'Total TTC']],
      body: [[
        commande.produitCommande || commande.cle.join(', '),
        commande.quantity,
        `${(prix / commande.quantity).toFixed(2)} €`,
        `${port.toFixed(2)} €`,
        `${(prix - port).toFixed(2)} €`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255 },
      margin: { left: margin, right: margin },
    });

    return doc;
  };

  const showInvoice = (cmd) => window.open(generateInvoiceDoc(cmd).output('dataurlnewwindow'));
  const downloadInvoice = (cmd) => generateInvoiceDoc(cmd).save(`facture_${cmd.numeroCommande}.pdf`);
  const printInvoice = (cmd) => {
    const doc = generateInvoiceDoc(cmd);
    doc.autoPrint();
    window.open(doc.output('bloburl'));
  };

  const sorted = [...commandes].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: 'green.700' }}>
        Détails des Commandes Payées
      </Typography>
      {loading && <CircularProgress color="success" />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && sorted.length === 0 && <Typography>Aucune commande payée trouvée.</Typography>}
      <Grid container spacing={3}>
        {sorted.map((cmd) => (
          <Grid item xs={12} key={cmd.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, border: '1px solid green.100' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'green.800' }}>
                  Nom du produit :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {cmd.numeroCle || cmd.produitCommande || cmd.cle.join(', ')}
                  </Typography>
                  {cmd.isCleAPasse && <Typography>(Clé à passe)</Typography>}
                </Box>
                <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, p: 2, mb: 2 }}>
                  <Typography variant="subtitle2">Modes de Livraison</Typography>
                  <Typography>Envoi : {cmd.deliveryType}</Typography>
                  <Typography>Récupération : {cmd.shippingMethod === 'expedition' ? 'Expédition' : 'Magasin'}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'green.800' }}>
                  Informations Client :
                </Typography>
                <Typography>Name : {cmd.nom}</Typography>
                <Typography>Commande # : {cmd.numeroCommande}</Typography>
                <Typography>Adresse : {cmd.adressePostale}</Typography>
                <Typography>Téléphone : {cmd.telephone}</Typography>
                <Typography>Email : {cmd.adresseMail}</Typography>
                <Typography>Prix : {`${parseFloat(cmd.prix).toFixed(2)} € TTC`}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {cmd.urlPhotoRecto && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoRecto)}
                      sx={{ width: 80, height: 80, cursor: 'pointer' }}
                      onClick={() => handleImageClick(decodeImage(cmd.urlPhotoRecto))}
                    />
                  )}
                  {cmd.urlPhotoVerso && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoVerso)}
                      sx={{ width: 80, height: 80, cursor: 'pointer' }}
                      onClick={() => handleImageClick(decodeImage(cmd.urlPhotoVerso))}
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ backgroundColor: 'green.50', p: 2 }}>
                <Button onClick={() => showInvoice(cmd)}>Afficher Facture</Button>
                <Button onClick={() => downloadInvoice(cmd)}>Télécharger Facture</Button>
                <Button onClick={() => printInvoice(cmd)}>Imprimer Facture</Button>
                <Button color="error" startIcon={<CancelIcon />} onClick={() => openCancelDialogFor(cmd)}>
                  Annuler la commande
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen={fullScreen}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Raison de l'annulation"
            fullWidth
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button color="error" onClick={handleConfirmCancel}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier la commande</DialogTitle>
        <DialogContent>
          <TextField name="nom" label="Nom" fullWidth value={editFormData.nom} onChange={handleEditChange} />
          <TextField name="ville" label="Ville" fullWidth value={editFormData.ville} onChange={handleEditChange} />
          <FormControlLabel
            control={<Checkbox name="isCleAPasse" checked={editFormData.isCleAPasse} onChange={handleCheckboxChange} />}
            label="Clé à passe"
          />
          <FormControlLabel
            control={<Checkbox name="hasCartePropriete" checked={editFormData.hasCartePropriete} onChange={handleCheckboxChange} />}
            label="Carte de propriété présente"
          />
          {!editFormData.hasCartePropriete && (
            <FormControlLabel
              control={<Checkbox name="attestationPropriete" checked={editFormData.attestationPropriete} onChange={handleCheckboxChange} />}
              label="Attestation perte carte"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
          <Button onClick={handleEditSubmit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} fullScreen={fullScreen} onWheel={handleWheel}>
        <DialogActions>
          <IconButton onClick={() => setOpenImageDialog(false)}><CloseIcon /></IconButton>
        </DialogActions>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              sx={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
