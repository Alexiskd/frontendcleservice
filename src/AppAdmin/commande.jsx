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
import logo from './logo.png';

const socket = io('https://cl-back.onrender.com');

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCancel, setOpenCancel] = useState(false);
  const [cancelCommande, setCancelCommande] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({ id: '', nom: '', ville: '', isCleAPasse: false, hasCartePropriete: true, attestationPropriete: false });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const decodeImage = img => img ? (img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`) : '';

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://cl-back.onrender.com/commande/paid', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on('commandeUpdate', fetchCommandes);
    return () => socket.off('commandeUpdate');
  }, []);

  // Annulation
  const handleOpenCancel = cmd => { setCancelCommande(cmd); setCancelReason(''); setOpenCancel(true); };
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) return alert('Raison requise');
    try {
      const res = await fetch(`https://cl-back.onrender.com/commande/cancel/${cancelCommande.numeroCommande}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchCommandes();
    } catch { alert('Erreur'); }
    setOpenCancel(false);
  };

  // Edition omitted for brevity...

  // Génération facture PDF
  const generateInvoiceDoc = commande => {
    const doc = new jsPDF('p','mm','a4');
    const margin = 15;
    // En-tête
    doc.setFillColor(27,94,32); doc.rect(0,margin,210,40,'F');
    doc.addImage(logo,'PNG',margin,margin,32,32);
    doc.setFontSize(8).setTextColor(255);
    doc.text(['MAISON BOUVET','20 rue de Lévis','75017 Paris','Tél : 01 42 67 47 28','Email : contact@cleservice.com'], margin+37, margin+12,{lineHeightFactor:1.5});
    // Client
    const rightX = 210 - margin;
    doc.setFont('helvetica','bold').setFontSize(10).setTextColor(0).text('Facturé à :', rightX, margin+12,{align:'right'});
    doc.setFont('helvetica','normal').setFontSize(8);
    [commande.nom, commande.adressePostale, commande.telephone && `Tél : ${commande.telephone}`, commande.adresseMail && `Email : ${commande.adresseMail}`]
      .filter(Boolean)
      .forEach((l,i)=>doc.text(l, rightX, margin+17+i*5,{align:'right'}));
    let y = margin + 45;
    // Case « Nom du produit » de la facture : on ajoute en dessous
    const prod = commande.numeroCle?.length
      ? commande.numeroCle.join(', ')
      : commande.produitCommande || (Array.isArray(commande.cle) ? commande.cle.join(', ') : commande.cle);
    const marque = commande.marque ? ` (${commande.marque})` : '';
    const prodText = prod + marque;
    doc.setFont('helvetica','bold').setFontSize(10).setTextColor(27,94,32);
    doc.text('Nom du produit :', margin, y);
    y += 6;
    doc.setFont('helvetica','normal').setFontSize(9).setTextColor(0);
    doc.text(prodText, margin, y);
    y += 10;
    // Tableau de détails
    const prix = parseFloat(commande.prix) || 0;
    const qte = commande.quantity || 1;
    const unit = prix / qte;
    const frais = commande.shippingMethod === 'expedition' ? 8 : 0;
    const fraisTxt = frais ? `-${frais.toFixed(2)} €` : '0.00 €';
    const total = (prix - frais).toFixed(2) + ' €';
    doc.autoTable({
      startY: y,
      head:[['Nom du produit','Quantité','Prix unitaire','Frais port','Total TTC']],
      body:[[prodText, qte.toString(), unit.toFixed(2)+' €', fraisTxt, total]],
      margin:{left:margin,right:margin}, headStyles:{fillColor:[27,94,32],textColor:255}, styles:{fontSize:9}
    });
    // Suite (livraison, détails, conditions)...
    return doc;
  };

  const showInvoice = c => window.open(generateInvoiceDoc(c).output('dataurlnewwindow'));
  const downloadInvoice = c => generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`);
  const printInvoice = c => { const d = generateInvoiceDoc(c); d.autoPrint(); window.open(d.output('bloburl')); };

  return (
    <Container maxWidth='lg' sx={{py:4,fontFamily:'Poppins,sans-serif',backgroundColor:'rgba(240,255,245,0.5)'}}>
      <Typography variant='h4' align='center' sx={{color:'green.700',fontWeight:600}}>Commandes Payées</Typography>
      {loading && <Box sx={{display:'flex',justifyContent:'center',my:4}}><CircularProgress/></Box>}
      {error && <Alert severity='error'>{error}</Alert>}
      {!loading && commandes.length===0 && !error && <Typography>Aucune commande trouvée.</Typography>}
      <Grid container spacing={3}>
        {commandes.map(c=>(
          <Grid item xs={12} key={c.id}>
            <Card sx={{borderRadius:3,boxShadow:3,border:'1px solid',borderColor:'green.100'}}>
              <CardContent sx={{p:3}}>
                <Typography variant='subtitle1' sx={{fontWeight:600,color:'green.800'}}>Nom du produit :</Typography>
                <Typography sx={{fontSize:'1.1rem',mb:2}}>{prodText}</Typography>
                {/* Reste des infos client, livraison, images...*/}
              </CardContent>
              <CardActions sx={{justifyContent:'space-between',p:2,backgroundColor:'green.50'}}>
                <Button onClick={()=>showInvoice(c)} variant='contained'>Afficher Facture</Button>
                <Button onClick={()=>downloadInvoice(c)} variant='contained' color='secondary'>Télécharger</Button>
                <Button onClick={()=>printInvoice(c)} variant='contained' color='info'>Imprimer</Button>
                <Button onClick={()=>handleOpenCancel(c)} variant='contained' color='error' startIcon={<CancelIcon/>}>Annuler</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Dialogues Annulation, Image Zoom... */}
    </Container>
  );
};

export default Commande;
