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
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
      const json = await response.json();
      if (response.ok && Array.isArray(json.data)) {
        setCommandes(json.data);
        setError(null);
      } else {
        throw new Error('Format inattendu des données');
      }
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
    if (!cancellationReason.trim()) return alert('Raison requise.');
    try {
      await fetch(`https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`, {
        method: 'DELETE',
      });
      fetchCommandes();
    } catch (err) {
      alert("Erreur d'annulation.");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoom(1);
    setOpenImageDialog(true);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 3));
  };

  const openEditDialogForCommande = (commande) => {
    setEditFormData({
      id: commande.id,
      nom: commande.nom || '',
      ville: commande.ville || '',
      isCleAPasse: !!commande.isCleAPasse,
      hasCartePropriete: commande.hasCartePropriete !== false,
      attestationPropriete: !!commande.attestationPropriete,
    });
    setOpenEditDialog(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.checked });
  };

  const handleEditFormSubmit = async () => {
    try {
      await fetch(`https://cl-back.onrender.com/commande/update/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      setOpenEditDialog(false);
      fetchCommandes();
    } catch (err) {
      alert(err.message);
    }
  };

  const generateInvoiceDoc = (commande) => {
    const doc = new jsPDF();
    doc.addImage('/logo.png', 'PNG', 15, 15, 32, 32);
    doc.text(`Facture pour ${commande.nom}`, 15, 60);
    doc.autoTable({
      head: [['Champ', 'Valeur']],
      body: [
        ['Nom', commande.nom],
        ['Ville', commande.ville],
        ['Prix', `${commande.prix} €`],
        ['Numéro de commande', commande.numeroCommande],
      ],
      startY: 70,
    });
    doc.text('Merci pour votre commande.', 15, doc.autoTable.previous.finalY + 20);
    return doc;
  };

  const showInvoice = (commande) => {
    const doc = generateInvoiceDoc(commande);
    window.open(doc.output('dataurlnewwindow'), '_blank');
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>Commandes Payées</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={3}>
        {commandes.map((commande) => (
          <Grid item xs={12} md={6} lg={4} key={commande.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{commande.nom}</Typography>
                <Typography color="textSecondary">{commande.ville}</Typography>
                <Typography>{commande.prix} €</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => showInvoice(commande)}>Afficher Facture</Button>
                <Button onClick={() => openEditDialogForCommande(commande)}>Modifier</Button>
                <Button onClick={() => openCancelDialog(commande)} color="error">Annuler</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Commande;
