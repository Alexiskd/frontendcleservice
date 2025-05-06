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
      if (!response.ok) throw new Error(`Erreur status ${response.status}`);
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
    if (!cancellationReason.trim()) return;
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Erreur status ${res.status}`);
      alert('Commande annulée');
      fetchCommandes();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'annulation');
    } finally {
      setOpenDialog(false);
      setCommandeToCancel(null);
    }
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

  const handleEditFormChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.checked });

  const handleEditFormSubmit = async () => {
    try {
      const res = await fetch(`https://cl-back.onrender.com/commande/update/${editFormData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Erreur update');
      alert('Commande mise à jour');
      setOpenEditDialog(false);
      fetchCommandes();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoom(1);
    setOpenImageDialog(true);
  };
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z + (e.deltaY>0?-0.1:0.1),0.5),3));
  };

  const handlePdfDisplay = (path) =>
    window.open(`https://cl-back.onrender.com/${path.replace(/\\/g,'/')}`, '_blank');

  const generateInvoiceDoc = (cmd) => {
    const doc = new jsPDF();
    doc.setFillColor(27,94,32);
    doc.rect(0,0,210,20,'F');
    doc.addImage(logo,'PNG',10,5,20,20);
    doc.text(`Facture pour ${cmd.nom}`, 10, 35);
    const body = Array.isArray(cmd.produits)
      ? cmd.produits.map(p=>[p.nom,p.reference,`${p.prix} €`]) : [];
    doc.autoTable({ head:[['Produit','Réf','Prix']], body, startY:45 });
    doc.text(`Total: ${cmd.prix} € TTC`, 10, doc.lastAutoTable.finalY+10);
    return doc;
  };
  const showInvoice = cmd => window.open(generateInvoiceDoc(cmd).output('dataurlnewwindow'));
  const downloadInvoice = cmd => generateInvoiceDoc(cmd).save(`facture_${cmd.numeroCommande}.pdf`);
  const printInvoice = cmd => { const d=generateInvoiceDoc(cmd); d.autoPrint(); window.open(d.output('bloburl')); };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>Commandes Payées</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={3}>
        {commandes.map(cmd=>(
          <Grid item xs={12} md={6} lg={4} key={cmd.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cmd.nom}</Typography>
                <Typography color="textSecondary">{cmd.ville}</Typography>
                <Typography>Prix : {cmd.prix} €</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={()=>showInvoice(cmd)}>Afficher Facture</Button>
                <Button onClick={()=>openEditDialogForCommande(cmd)}>Modifier</Button>
                <Button color="error" onClick={()=>openCancelDialog(cmd)}>Annuler</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} fullScreen={fullScreen}>
        <DialogTitle>Annuler commande</DialogTitle>
        <DialogContent>
          <TextField label="Raison" fullWidth multiline value={cancellationReason} onChange={e=>setCancellationReason(e.target.value)}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Annuler</Button>
          <Button color="error" onClick={handleConfirmCancel}>Confirmer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={()=>setOpenEditDialog(false)} fullScreen={fullScreen}>
        <DialogTitle>Modifier commande</DialogTitle>
        <DialogContent>
          <TextField name="nom" label="Nom" fullWidth margin="dense" value={editFormData.nom} onChange={handleEditFormChange}/>
          <TextField name="ville" label="Ville" fullWidth margin="dense" value={editFormData.ville} onChange={handleEditFormChange}/>
          <FormControlLabel control={<Checkbox name="isCleAPasse" checked={editFormData.isCleAPasse} onChange={handleCheckboxChange}/>} label="Clé à passe"/>
          <FormControlLabel control={<Checkbox name="hasCartePropriete" checked={editFormData.hasCartePropriete} onChange={handleCheckboxChange}/>} label="Carte propriété"/>
          <FormControlLabel control={<Checkbox name="attestationPropriete" checked={editFormData.attestationPropriete} onChange={handleCheckboxChange}/>} label="Attestation perte"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEditDialog(false)}>Annuler</Button>
          <Button onClick={handleEditFormSubmit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImageDialog} onClose={()=>setOpenImageDialog(false)} fullScreen={fullScreen} onWheel={handleWheel}>
        <DialogActions>
          <IconButton onClick={()=>setOpenImageDialog(false)}><CloseIcon/></IconButton>
        </DialogActions>
        <DialogContent>
          <Box component="img" src={selectedImage} alt="Zoom" sx={{transform:`scale(${zoom})`,transition:'transform 0.2s'}}/>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
