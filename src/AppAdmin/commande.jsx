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
      const response = await fetch('https://cl-back.onrender.com/commande/paid', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Erreur lors de la récupération (status ${response.status})`);
      const json = await response.json();
      setCommandes(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement commandes :', err);
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
    if (!cancellationReason.trim()) return alert("Veuillez saisir une raison d'annulation.");
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/cancel/${commandeToCancel.numeroCommande}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      alert(data.success ? "Commande annulée avec succès." : "Échec annulation.");
      fetchCommandes();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation.");
    } finally {
      setOpenDialog(false);
      setCommandeToCancel(null);
    }
  };

  const handleImageClick = (url) => { setSelectedImage(url); setZoom(1); setOpenImageDialog(true); };
  const handleWheel = (e) => { e.preventDefault(); setZoom(z => Math.min(Math.max(z + (e.deltaY>0?-0.1:0.1),0.5),3)); };
  const handlePdfDisplay = path => window.open(`https://cl-back.onrender.com/${path.replace(/\\/g,'/')}`,'_blank');

  const openEditDialogFor = c => {
    setEditFormData({
      id: c.id,
      nom: c.nom||'',
      ville: c.ville||'',
      isCleAPasse: c.isCleAPasse||false,
      hasCartePropriete: c.hasCartePropriete!==undefined?c.hasCartePropriete:true,
      attestationPropriete: c.attestationPropriete||false,
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = e => setEditFormData(d=>({...d,[e.target.name]: e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`https://cl-back.onrender.com/commande/update/${editFormData.id}`,{
        method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editFormData)
      }); if(!res.ok) throw new Error('Échec MAJ');
      alert('Commande mise à jour');
      setOpenEditDialog(false);
      fetchCommandes();
    } catch(err){alert(err.message);}  };

  // Génération PDF
  const generateInvoiceDoc = (commande) => {
    const doc = new jsPDF('p','mm','a4');
    const margin = 15;
    // En-tête
    doc.setFillColor(27,94,32); doc.rect(0,margin,210,40,'F');
    doc.addImage(logo,'PNG',margin,margin,32,32);
    doc.setFontSize(8).setTextColor(255,255,255);
    doc.text([
      'MAISON BOUVET','20 rue de Lévis','75017 Paris','Tél : 01 42 67 47 28','Email : contact@cleservice.com'
    ], margin+37, margin+12, {lineHeightFactor:1.5});
    // Client
    const rightX=210-margin;
    doc.setFont('helvetica','bold').setFontSize(10).setTextColor(0);
    doc.text('Facturé à :', rightX, margin+12, {align:'right'});
    doc.setFont('helvetica','normal').setFontSize(8);
    [commande.nom, commande.adressePostale, commande.telephone && `Tél : ${commande.telephone}`, commande.adresseMail && `Email : ${commande.adresseMail}`]
      .filter(Boolean)
      .forEach((l,i)=>doc.text(l, rightX, margin+17+i*5,{align:'right'}));
    let y=margin+45;
    // Produit
    const produit = commande.numeroCle?.length?commande.numeroCle.join(', '):commande.produitCommande||(Array.isArray(commande.cle)?commande.cle.join(', '):commande.cle);
    const marque = commande.marque?` (${commande.marque})`:'';
    const prodText = produit+marque;
    doc.setFont('helvetica','bold').setFontSize(10).setTextColor(27,94,32);
    doc.text(`Produit : ${prodText}`, margin,y);
    y+=8;
    // Prix
    const prix= parseFloat(commande.prix)||0;
    const qte= commande.quantity||1;
    const unit= prix/qte;
    const frais= commande.shippingMethod==='expedition'?8:0;
    const fraisTxt= frais?`-${frais.toFixed(2)} €`:'0.00 €';
    const total= (prix-frais).toFixed(2)+' €';
    // Tableau
    doc.autoTable({
      startY: y,
      head:[['Nom du produit','Quantité','Prix unitaire','Frais port','Total TTC']],
      body:[[prodText, qte.toString(), unit.toFixed(2)+' €', fraisTxt, total]],
      margin:{left:margin,right:margin},
      headStyles:{fillColor:[27,94,32], textColor:255},
      styles:{fontSize:9},
    });
    // Suite (livraison, détails, conditions)...
    return doc;
  };

  const showInvoice = c=>window.open(generateInvoiceDoc(c).output('dataurlnewwindow'));
  const downloadInvoice = c=>generateInvoiceDoc(c).save(`facture_${c.numeroCommande}.pdf`);
  const printInvoice = c=>{const d=generateInvoiceDoc(c); d.autoPrint(); window.open(d.output('bloburl'));};

  const sorted = [...commandes].sort((a,b)=>b.id.localeCompare(a.id));

  return (
    <Container maxWidth="lg" sx={{py:4,fontFamily:'"Poppins",sans-serif',backgroundColor:'rgba(240,255,245,0.5)'}}>
      <Typography variant="h4" align="center" gutterBottom sx={{color:'green.700',fontWeight:600}}>
        Détails des Commandes Payées
      </Typography>
      {loading && <Box sx={{display:'flex',justifyContent:'center',my:4}}><CircularProgress color="success"/></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && sorted.length===0 && !error && <Typography align="center">Aucune commande payée trouvée.</Typography>}
      <Grid container spacing={3}>
        {sorted.map(c=> (
          <Grid item xs={12} key={c.id}>
            <Card sx={{borderRadius:3,boxShadow:3,border:'1px solid',borderColor:'green.100',overflow:'hidden'}}>
              <CardContent sx={{p:3}}>
                {/* Nom du produit */}
                <Typography variant="subtitle1" sx={{fontWeight:600,color:'green.800',mb:1}}>Nom du produit :</Typography>
                <Box sx={{display:'flex',alignItems:'center',gap:1,mb:2}}>
                  <Typography variant="body1" sx={{fontSize:'1.1rem'}}>
                    {c.numeroCle||c.produitCommande||(Array.isArray(c.cle)?c.cle.join(', '):c.cle)||'Non renseigné'}
                    {c.marque?` (${c.marque})`:''}
                  </Typography>
                  {c.isCleAPasse && <Typography variant="body2" sx={{fontWeight:'bold',color:'secondary.main'}}>(Clé à passe)</Typography>}
                </Box>
                {/* Modes livraison */}
                <Box sx={{backgroundColor:'#f5f5f5',borderRadius:2,p:2,mb:2}}>
                  <Typography variant="subtitle2" sx={{fontWeight:600,mb:1}}>Modes de Livraison</Typography>
                  <Box sx={{display:'flex',justifyContent:'space-between'}}>
                    <Typography variant="body2">Mode d'envoi : {c.deliveryType||c.typeLivraison.join(', ')}</Typography>
                    <Typography variant="body2">Mode de récupération : {c.shippingMethod==='expedition'? 'Expédition':'En magasin'}</Typography>
                  </Box>
                </Box>
                <Divider sx={{mb:2}}/>
                {/* Informations client */}
                <Typography variant="subtitle1" sx={{fontWeight:600,color:'green.800',mb:1}}>Informations Client :</Typography>
                <Box sx={{mb:2}}>
                  <Typography variant="h6" sx={{fontWeight:600}}>{c.nom}</Typography>
                  <Typography variant="body2" sx={{mt:1}}>Commande n°: {c.numeroCommande}</Typography>
                  {/* Adresse, CP, Ville */}
                  {c.adressePostale.split(',').map((p,i)=>(<Typography key={i} variant="body2">{p.trim()}</Typography>))}
                  <Typography variant="body2" sx={{mt:1}}><PhoneIcon sx={{verticalAlign:'middle',mr:1}}/>{c.telephone}</Typography>
                  <Typography variant="body2"><EmailIcon sx={{verticalAlign:'middle',mr:1}}/>{c.adresseMail}</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{fontWeight:600,color:'green.800',mb:1}}>Prix :</Typography>
                <Typography variant="body2" sx={{mb:2}}>{parseFloat(c.prix).toFixed(2)} € TTC</Typography>
                {/* Documents et images...*/}
                <Box sx={{display:'flex',gap:2,mt:2}}>
                  {c.urlPhotoRecto && <Box component="img" src={decodeImage(c.urlPhotoRecto)} alt="Recto" sx={{width:80,height:80,objectFit:'cover',borderRadius:'50%',cursor:'pointer'}} onClick={()=>handleImageClick(decodeImage(c.urlPhotoRecto))}/>}                  {c.urlPhotoVerso && <Box component="img" src={decodeImage(c.urlPhotoVerso)} alt="Verso" sx={{width:80,height:80,objectFit:'cover',borderRadius:'50%',cursor:'pointer'}} onClick={()=>handleImageClick(decodeImage(c.urlPhotoVerso))}/>}                </Box>
              </CardContent>
              <CardActions sx={{justifyContent:'space-between',backgroundColor:'green.50',p:2}}>
                <Button variant="contained" color="primary" onClick={()=>showInvoice(c)}>Afficher Facture</Button>
                <Button variant="contained" color="secondary" onClick={()=>downloadInvoice(c)}>Télécharger Facture</Button>
                <Button variant="contained" color="info" onClick={()=>printInvoice(c)}>Imprimer Facture</Button>
                <Button variant="contained" color="error" startIcon={<CancelIcon/>} onClick={()=>openCancelDialog(c)}>Annuler</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogues Annulation, Édition, Zoom image */}
      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} fullScreen={fullScreen} PaperProps={{sx:{p:2,backgroundColor:'green.50'}}}>
        <DialogTitle>Confirmer Annulation</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Raison" variant="outlined" value={cancellationReason} onChange={e=>setCancellationReason(e.target.value)} required/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={!cancellationReason.trim()}>Confirmer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={()=>setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier Commande</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" name="nom" label="Nom" value={editFormData.nom} onChange={handleEditChange}/>
          <TextField fullWidth margin="normal" name="ville" label="Ville" value={editFormData.ville} onChange={handleEditChange}/>
          <FormControlLabel control={<Checkbox name="isCleAPasse" checked={editFormData.isCleAPasse} onChange={handleEditChange}/>} label="Clé à passe"/>
          <FormControlLabel control={<Checkbox name="hasCartePropriete" checked={editFormData.hasCartePropriete} onChange={handleEditChange}/>} label="Carte propriété présente"/>
          {!editFormData.hasCartePropriete && <FormControlLabel control={<Checkbox name="attestationPropriete" checked={editFormData.attestationPropriete} onChange={handleEditChange}/>} label="Attestation perte"/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEditDialog(false)}>Annuler</Button>
          <Button onClick={handleEditSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImageDialog} onClose={()=>{setOpenImageDialog(false);setZoom(1);}} fullScreen={fullScreen} maxWidth="lg" fullWidth onWheel={handleWheel} sx={{display:'flex',justifyContent:'center',alignItems:'center'}}>
        <DialogActions sx={{justifyContent:'flex-end'}}><IconButton onClick={()=>{setOpenImageDialog(false);setZoom(1);}}><CloseIcon/></IconButton></DialogActions>
        <DialogContent sx={{display:'flex',justifyContent:'center'}}>
          {selectedImage && <Box component="img" src={selectedImage} alt="Zoom" sx={{maxWidth:'100%',maxHeight:'80vh',transform:`scale(${zoom})`,transition:'transform 0.2s'}}/>}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;

