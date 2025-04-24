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
      const response = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation (status ${response.status})`);
      }
      const data = await response.json();
      alert(
        data?.success
          ? "Commande annulée avec succès."
          : "Erreur lors de l'annulation de la commande."
      );
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

  const handlePdfDisplay = (pdfPath) => {
    const fullPdfUrl = `https://cl-back.onrender.com/${pdfPath.replace(/\\/g, '/')}`;
    window.open(fullPdfUrl, '_blank');
  };

  const openEditDialogForCommande = (commande) => {
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

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleEditFormSubmit = async () => {
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

    // En-tête
    doc.setFillColor(27, 94, 32);
    doc.rect(0, margin, 210, 40, 'F');
    const logoWidth = 32, logoHeight = 32;
    doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);
    const leftTextX = margin + logoWidth + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255,255,255);
    doc.text(
      [
        "MAISON BOUVET",
        "20 rue de Lévis",
        "75017 Paris",
        "Tél : 01 42 67 47 28",
        "Email : contact@cleservice.com",
      ],
      leftTextX,
      margin + 12,
      { lineHeightFactor: 1.5 }
    );

    // Client
    const rightX = 210 - margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Facturé à :", rightX, margin + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    [
      commande.nom,
      commande.adressePostale,
      commande.telephone ? `Tél : ${commande.telephone}` : '',
      commande.adresseMail ? `Email : ${commande.adresseMail}` : '',
    ]
      .filter(Boolean)
      .forEach((txt, i) =>
        doc.text(txt, rightX, margin + 17 + i*5, { align: 'right' })
      );

    let currentY = margin + 45;
    const prixProduit = parseFloat(commande.prix);
    const fraisLivraison = commande.shippingMethod === 'expedition' ? 8 : 0;
    const fraisAffichage = fraisLivraison > 0 ? "8.00 €" : "0.00 €";
    const totalTTC = prixProduit - fraisLivraison;

    // Produit
    const produit = commande.numeroCle || commande.produitCommande || (commande.cle?.join?.(', ') ?? 'Produit');
    const marque = commande.marque || '';
    const produitAffiche = marque ? `${produit} (${marque})` : produit;
    const quantite = commande.quantity?.toString() || "1";
    const unitPrice = parseFloat(quantite) > 0 ? prixProduit/parseFloat(quantite) : prixProduit;

    doc.autoTable({
      startY: currentY,
      head: [['Produit','Quantité','Prix Unitaire','Frais port','Total TTC']],
      body: [[produitAffiche,quantite,unitPrice.toFixed(2)+' €',fraisAffichage, totalTTC.toFixed(2)+' €']],
      theme:'grid',
      headStyles:{ fillColor:[27,94,32], textColor:255 },
      styles:{ fontSize:12 },
      margin:{ left:margin, right:margin }
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Modes
    doc.setFontSize(10);
    doc.setTextColor(27,94,32);
    doc.text(`Mode d'envoi : ${commande.deliveryType || commande.typeLivraison?.join(', ') || 'Non renseigné'}`, margin, currentY);
    currentY+=7;
    doc.text(`Mode récupération : ${commande.shippingMethod==='expedition'?'Expédition':'En magasin'}`, margin, currentY);
    currentY+=10;

    // Détails commande
    doc.setFontSize(10);
    doc.text("Détails :", margin, currentY); currentY+=7;
    doc.setFontSize(8);
    doc.text(`N° commande : ${commande.numeroCommande}`, margin, currentY); currentY+=6;
    doc.text(`Statut : ${commande.status}`, margin, currentY); currentY+=10;

    // Réglement & CGV
    doc.setFontSize(12);
    doc.text('Règlement : Carte Bancaire (CB)', margin, currentY); currentY+=10;
    const conditions = "CGV en ligne: produits vendus exclusivement en ligne. Paiement CB. Annulation possible frais applicables. Coordonnées bancaires: IBAN FR76... BIC AGRIFRPP882";
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(conditions, 180);
    doc.text(lines, 105, currentY, { align:'center' });

    return doc;
  };

  const showInvoice = (commande) => {
    const doc = generateInvoiceDoc(commande);
    window.open(doc.output('dataurlnewwindow'), '_blank');
  };
  const downloadInvoice = (commande) => {
    const doc = generateInvoiceDoc(commande);
    doc.save(`facture_${commande.numeroCommande}.pdf`);
  };
  const printInvoice = (commande) => {
    const doc = generateInvoiceDoc(commande);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const sortedCommandes = [...commandes].sort((a,b)=>b.id.localeCompare(a.id));

  return (
    <Container maxWidth="lg" sx={{ py:4, backgroundColor:'rgba(240,255,245,0.5)' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color:'green.700' }}>
        Détails des Commandes Payées
      </Typography>
      {loading && <Box sx={{ textAlign:'center', my:4 }}><CircularProgress color="success"/></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && sortedCommandes.length===0 && (
        <Typography align="center">Aucune commande payée trouvée.</Typography>
      )}
      <Grid container spacing={3}>
        {sortedCommandes.map(cmd => (
          <Grid item xs={12} key={cmd.id}>
            <Card sx={{ borderRadius:3, boxShadow:3, border:'1px solid green.100' }}>
              <CardContent sx={{ p:3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight:600, color:'green.800', mb:1 }}>
                  Nom du produit :
                </Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
                  <Typography variant="body1" sx={{ fontSize:'1.1rem' }}>
                    {cmd.numeroCle || cmd.produitCommande || (Array.isArray(cmd.cle)?cmd.cle.join(', '):cmd.cle)||'Non renseigné'}
                    {cmd.marque?` (${cmd.marque})`:''}
                  </Typography>
                  {cmd.isCleAPasse && <CheckCircleIcon color="secondary" />}
                </Box>

                <Box sx={{ backgroundColor:'#f5f5f5', borderRadius:2, p:2, mb:2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1 }}>Modes de Livraison</Typography>
                  <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                    <Typography variant="body2">
                      Envoi : {cmd.deliveryType || cmd.typeLivraison?.join(', ')||'Non renseigné'}
                    </Typography>
                    <Typography variant="body2">
                      Récup : {cmd.shippingMethod==='expedition'?'Expédition':'En magasin'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb:2 }}/>

                <Typography variant="subtitle1" sx={{ fontWeight:600, color:'green.800', mb:1 }}>
                  Informations Client :
                </Typography>
                <Box sx={{ mb:2 }}>
                  <Typography variant="h6" sx={{ fontWeight:600 }}>{cmd.nom}</Typography>
                  <Typography variant="body2" sx={{ mt:1 }}>N° commande : {cmd.numeroCommande}</Typography>
                  <Box sx={{ display:'flex', alignItems:'center', mb:0.5 }}>
                    <LocationOnIcon sx={{ color:'green.500', mr:1 }}/>
                    <Typography variant="body2">{cmd.adressePostale}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', mt:1 }}>
                    <PhoneIcon sx={{ color:'green.500', mr:1 }}/>
                    <Typography variant="body2">{cmd.telephone}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', mt:1 }}>
                    <EmailIcon sx={{ color:'green.500', mr:1 }}/>
                    <Typography variant="body2">{cmd.adresseMail}</Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight:600, color:'green.800', mb:1 }}>
                  Prix :
                </Typography>
                <Typography variant="body2" sx={{ mb:2 }}>
                  {parseFloat(cmd.prix).toFixed(2)} € TTC
                </Typography>

                {cmd.propertyCardNumber && (
                  <Box sx={{ mt:2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight:600 }}>N° carte propriété :</Typography>
                    <Typography variant="body2">{cmd.propertyCardNumber}</Typography>
                  </Box>
                )}

                <Box sx={{ display:'flex', gap:2, mt:2 }}>
                  {cmd.urlPhotoRecto && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoRecto)}
                      alt="Recto"
                      sx={{ width:80, height:80, objectFit:'cover', borderRadius:'50%', cursor:'pointer' }}
                      onClick={()=>handleImageClick(decodeImage(cmd.urlPhotoRecto))}
                    />
                  )}
                  {cmd.urlPhotoVerso && (
                    <Box
                      component="img"
                      src={decodeImage(cmd.urlPhotoVerso)}
                      alt="Verso"
                      sx={{ width:80, height:80, objectFit:'cover', borderRadius:'50%', cursor:'pointer' }}
                      onClick={()=>handleImageClick(decodeImage(cmd.urlPhotoVerso))}
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent:'space-between', p:2, backgroundColor:'green.50' }}>
                <Button variant="contained" color="primary" onClick={()=>showInvoice(cmd)}>Afficher Facture</Button>
                <Button variant="contained" color="secondary" onClick={()=>downloadInvoice(cmd)}>Télécharger Facture</Button>
                <Button variant="contained" color="info" onClick={()=>printInvoice(cmd)}>Imprimer Facture</Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={()=>openCancelDialog(cmd)}
                >
                  Annuler
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog annulation */}
      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} fullScreen={fullScreen} PaperProps={{ sx:{ p:2 } }}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Raison"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={e=>setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={!cancellationReason.trim()}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog image */}
      <Dialog open={openImageDialog} onClose={()=>setOpenImageDialog(false)} maxWidth="lg" fullScreen={fullScreen}>
        <DialogActions>
          <IconButton onClick={()=>setOpenImageDialog(false)}><CloseIcon/></IconButton>
        </DialogActions>
        <DialogContent onWheel={handleWheel} sx={{ textAlign:'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Zoom"
              sx={{ transform:`scale(${zoom})`, transition:'transform 0.2s' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
