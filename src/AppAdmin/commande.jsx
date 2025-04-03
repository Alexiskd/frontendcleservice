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

  // Ouverture du formulaire d'édition avec les données existantes
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

    // En-tête avec fond vert et logo
    doc.setFillColor(27, 94, 32);
    doc.rect(0, margin, 210, 40, 'F');
    const logoWidth = 32, logoHeight = 32;
    doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);
    const leftTextX = margin + logoWidth + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
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

    // Coordonnées du client (affichées à droite)
    const rightX = 210 - margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Facturé à :", rightX, margin + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const rightTexts = [
      commande.nom,
      commande.adressePostale,
      commande.telephone ? `Tél : ${commande.telephone}` : '',
      commande.adresseMail ? `Email : ${commande.adresseMail}` : '',
    ].filter(Boolean);
    rightTexts.forEach((txt, i) => {
      doc.text(txt, rightX, margin + 17 + i * 5, { align: 'right' });
    });

    let currentY = margin + 45;

    // Affichage du produit commandé
    // On utilise le contenu de "numeroCle" s'il est renseigné, sinon on bascule sur "produitCommande" ou "cle"
    const produit = commande.numeroCle || commande.produitCommande || 
      (commande.cle && commande.cle.length
        ? (Array.isArray(commande.cle) ? commande.cle.join(', ') : commande.cle)
        : 'Produit');
    const marque = commande.marque || '';
    const produitAffiche = marque ? `${produit} (${marque})` : produit;
    const quantite = commande.quantity ? commande.quantity.toString() : "1";
    const prixProduit = parseFloat(commande.prix);
    const fraisLivraison = commande.fraisLivraison ? parseFloat(commande.fraisLivraison) : 0.0;
    const unitPrice = parseFloat(quantite) > 0 ? prixProduit / parseFloat(quantite) : prixProduit;
    const totalTTC = prixProduit + fraisLivraison;

    // Tableau récapitulatif avec "Nom du produit" en première colonne
    const tableHead = [['Nom du produit', 'Quantité', 'Prix Unitaire', 'Frais de port', 'Total TTC']];
    const tableBody = [[
      produitAffiche,
      quantite,
      unitPrice.toFixed(2) + ' €',
      fraisLivraison.toFixed(2) + ' €',
      totalTTC.toFixed(2) + ' €'
    ]];

    doc.autoTable({
      startY: currentY,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [27, 94, 32], textColor: 255, halign: 'left' },
      styles: { fontSize: 12, halign: 'left' },
      margin: { left: margin, right: margin },
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Autres détails complémentaires de la commande
    doc.setFontSize(10);
    doc.setTextColor(27, 94, 32);
    doc.text("Détails de la commande :", margin, currentY);
    currentY += 7;
    doc.setFontSize(8);
    doc.text(`Numéro de commande : ${commande.numeroCommande}`, margin, currentY);
    currentY += 6;
    doc.text(`Statut : ${commande.status}`, margin, currentY);
    currentY += 6;
    doc.text(
      `Type de livraison : ${commande.typeLivraison ? commande.typeLivraison.join(', ') : 'Non renseigné'}`,
      margin,
      currentY
    );
    currentY += 6;
    doc.text(`Méthode d'expédition : ${commande.shippingMethod || 'Non renseigné'}`, margin, currentY);
    currentY += 6;
    doc.text(`Delivery Type : ${commande.deliveryType || 'Non renseigné'}`, margin, currentY);
    currentY += 10;

    // Mode de règlement et conditions de vente
    doc.setFontSize(12);
    doc.text('Mode de règlement : Carte Bancaire (CB)', margin, currentY);
    currentY += 10;
    const conditions =
      "CONDITIONS GÉNÉRALES DE VENTE EN LIGNE : Les produits commandés sur notre site sont vendus exclusivement en ligne et payables par carte bancaire (CB). La commande est confirmée dès réception du paiement. En cas d'annulation, des frais pourront être appliqués conformément à notre politique. Nos coordonnées bancaires : IBAN : FR76 1820 6004 1744 1936 2200 145 - BIC : AGRIFRPP882";
    const conditionsLines = doc.splitTextToSize(conditions, 180);
    doc.text(conditionsLines, 105, currentY, { align: 'center' });
    currentY += conditionsLines.length * 5;

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

  // Tri des commandes dans l'ordre décroissant
  const sortedCommandes = [...commandes].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: 'rgba(240, 255, 245, 0.5)',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ color: 'green.700', fontWeight: 600 }}>
        Détails des Commandes Payées
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="success" />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && sortedCommandes.length === 0 && !error && (
        <Typography align="center" variant="body1">
          Aucune commande payée trouvée.
        </Typography>
      )}
      <Grid container spacing={3}>
        {sortedCommandes.map((commande) => (
          <Grid item xs={12} key={commande.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'green.100',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ backgroundColor: 'white' }}>
                {/* Affichage du nom du produit */}
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Nom du produit :
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2">
                    {commande.numeroCle ||
                      (commande.produitCommande
                        ? commande.produitCommande
                        : (Array.isArray(commande.cle)
                            ? commande.cle.join(', ')
                            : commande.cle || 'Non renseigné'))}
                    {commande.marque ? ` (${commande.marque})` : ''}
                  </Typography>
                  {commande.isCleAPasse && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      (Clé à passe)
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Informations client */}
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Informations Client :
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'green.800' }}>
                    {commande.nom}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>
                    Numéro de commande : {commande.numeroCommande || "Non renseigné"}
                  </Typography>
                  {(() => {
                    const adresseParts = commande.adressePostale ? commande.adressePostale.split(',') : [];
                    return (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <LocationOnIcon sx={{ color: 'green.500', mr: 1 }} />
                          <Typography variant="body1">
                            {adresseParts[0] ? adresseParts[0].trim() : commande.adressePostale}
                          </Typography>
                        </Box>
                        {adresseParts[1] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                              Code Postal :
                            </Typography>
                            <Typography variant="body1">{adresseParts[1].trim()}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 4 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                            Ville :
                          </Typography>
                          <TextField
                            variant="standard"
                            value={commande.ville || ""}
                            placeholder="Non renseignée"
                            InputProps={{ disableUnderline: true, readOnly: true }}
                            sx={{ width: '120px' }}
                          />
                        </Box>
                      </>
                    );
                  })()}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Quantité de copies :
                    </Typography>
                    <Typography variant="body1">{commande.quantity}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon sx={{ color: 'green.500', mr: 1 }} />
                    <Typography variant="body1">{commande.telephone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <EmailIcon sx={{ color: 'green.500', mr: 1 }} />
                    <Typography variant="body1">{commande.adresseMail}</Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Prix : {commande.prix ? `${parseFloat(commande.prix).toFixed(2)} € TTC` : '-'}
                </Typography>

                {commande.propertyCardNumber && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700' }}>
                      Numéro de la carte de propriété :
                    </Typography>
                    <Typography variant="body2">{commande.propertyCardNumber}</Typography>
                  </Box>
                )}
                {commande.hasCartePropriete === false && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                      Documents complémentaires (en cas de perte de la carte) :
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {commande.idCardFront && (
                        <Box
                          component="img"
                          src={decodeImage(commande.idCardFront)}
                          alt="Carte d'identité Recto"
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            boxShadow: 2,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageClick(decodeImage(commande.idCardFront))}
                        />
                      )}
                      {commande.idCardBack && (
                        <Box
                          component="img"
                          src={decodeImage(commande.idCardBack)}
                          alt="Carte d'identité Verso"
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            boxShadow: 2,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageClick(decodeImage(commande.idCardBack))}
                        />
                      )}
                      {commande.domicileJustificatif && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handlePdfDisplay(commande.domicileJustificatif)}
                        >
                          Voir Justificatif de Domicile (PDF)
                        </Button>
                      )}
                    </Box>
                    {commande.attestationPropriete && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'green.600' }}>
                        Attestation de perte de la carte : Acceptée
                      </Typography>
                    )}
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {commande.urlPhotoRecto && (
                    <Box
                      component="img"
                      src={decodeImage(commande.urlPhotoRecto)}
                      alt="Photo Recto"
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        boxShadow: 2,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleImageClick(decodeImage(commande.urlPhotoRecto))}
                    />
                  )}
                  {commande.urlPhotoVerso && (
                    <Box
                      component="img"
                      src={decodeImage(commande.urlPhotoVerso)}
                      alt="Photo Verso"
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        boxShadow: 2,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleImageClick(decodeImage(commande.urlPhotoVerso))}
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', backgroundColor: 'green.50', p: 2 }}>
                <Button variant="contained" color="primary" onClick={() => showInvoice(commande)}>
                  Afficher Facture
                </Button>
                <Button variant="contained" color="secondary" onClick={() => downloadInvoice(commande)}>
                  Télécharger Facture
                </Button>
                <Button variant="contained" color="info" onClick={() => printInvoice(commande)}>
                  Imprimer Facture
                </Button>
                <Button variant="contained" color="warning" onClick={() => openEditDialogForCommande(commande)}>
                  Modifier la commande
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CancelIcon />}
                  sx={{
                    borderRadius: 20,
                    backgroundColor: 'red.400',
                    '&:hover': { backgroundColor: 'red.600' },
                  }}
                  onClick={() => openCancelDialog(commande)}
                >
                  Annuler la commande
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: 'green.50' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'green.800' }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Veuillez saisir la raison de l'annulation de la commande (cette information est obligatoire) :
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Raison de l'annulation"
            type="text"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="success">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={!cancellationReason.trim()}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier la commande</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            fullWidth
            margin="normal"
            name="nom"
            value={editFormData.nom}
            onChange={handleEditFormChange}
          />
          <TextField
            label="Ville"
            fullWidth
            margin="normal"
            name="ville"
            value={editFormData.ville}
            onChange={handleEditFormChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="isCleAPasse"
                checked={editFormData.isCleAPasse}
                onChange={handleCheckboxChange}
              />
            }
            label="Clé à passe"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="hasCartePropriete"
                checked={editFormData.hasCartePropriete}
                onChange={handleCheckboxChange}
              />
            }
            label="Carte de propriété présente"
          />
          {!editFormData.hasCartePropriete && (
            <FormControlLabel
              control={
                <Checkbox
                  name="attestationPropriete"
                  checked={editFormData.attestationPropriete}
                  onChange={handleCheckboxChange}
                />
              }
              label="Attestation de perte de la carte"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
          <Button onClick={handleEditFormSubmit} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImageDialog}
        onClose={() => {
          setOpenImageDialog(false);
          setZoom(1);
        }}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        onWheel={handleWheel}
        sx={{
          p: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        <DialogActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <IconButton
            onClick={() => {
              setOpenImageDialog(false);
              setZoom(1);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Enlargi"
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s',
                transformOrigin: 'center',
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Commande;
