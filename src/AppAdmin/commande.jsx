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
  const [openDialog, setOpenDialog] = useState(false);
  const [commandeToCancel, setCommandeToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

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

  const generateInvoiceDoc = (commande) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;

    // En-tête avec un fond vert et le logo
    doc.setFillColor(27, 94, 32);
    doc.rect(0, margin, 210, 40, 'F');

    const logoWidth = 32, logoHeight = 32;
    doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);

    // Texte à gauche : adaptation pour un site de reproduction en ligne
    const leftTextX = margin + logoWidth + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      [
        "REPRODUCTION EN LIGNE",
        "www.votresite-reproduction.com",
        "Service en ligne de reproductions de documents",
        "Tél : 01 42 67 47 28",
        "Email : contact@reproduction.com",
      ],
      leftTextX,
      margin + 12,
      { lineHeightFactor: 1.5 }
    );

    // Texte à droite
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

    // Affichage de la date de commande
    const orderDate = commande.dateCommande
      ? new Date(commande.dateCommande).toLocaleDateString()
      : "Non renseignée";
    doc.setFontSize(9);
    doc.setTextColor(27, 94, 32);
    doc.text(`Date de commande : ${orderDate}`, margin, margin + 45);

    // Préparation du tableau de détails de la commande
    let currentY = margin + 55;
    const articleText =
      commande.cle && commande.cle.length
        ? (Array.isArray(commande.cle)
            ? commande.cle.join(', ')
            : commande.cle)
        : 'Article';
    // Remplacer la référence par le nom de la marque
    const marque = commande.marque || "Reproduction En Ligne";
    const quantite = commande.quantity ? commande.quantity.toString() : "1";
    const prixTTC = parseFloat(commande.prix);
    const tauxTVA = 0.20;
    const prixHT = prixTTC / (1 + tauxTVA);
    const tableHead = [['Article', 'Marque', 'Quantité', 'Sous-total']];
    const tableBody = [[articleText, marque, quantite, prixHT.toFixed(2) + ' €']];

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

    // Affichage des totaux et TVA
    const fraisLivraison = 0.0,
      totalTTC = prixTTC,
      montantTVA = prixTTC - prixHT;
    const rightAlignX = 210 - margin;

    doc.setFontSize(12);
    doc.setTextColor(27, 94, 32);
    doc.text('Sous-total', rightAlignX - 80, currentY);
    doc.text(prixHT.toFixed(2) + ' €', rightAlignX, currentY, { align: 'right' });
    currentY += 7;
    doc.text('Frais de livraison', rightAlignX - 80, currentY);
    doc.text(fraisLivraison.toFixed(2) + ' €', rightAlignX, currentY, { align: 'right' });
    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Total TTC', rightAlignX - 80, currentY);
    doc.text(totalTTC.toFixed(2) + ' €', rightAlignX, currentY, { align: 'right' });
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('TVA', rightAlignX - 80, currentY);
    doc.text(montantTVA.toFixed(2) + ' €', rightAlignX, currentY, { align: 'right' });
    currentY += 15;

    // Conditions de vente adaptées au contexte du site de reproduction en ligne
    doc.setFontSize(10);
    doc.setTextColor(27, 94, 32);
    const conditions =
      "CONDITIONS GÉNÉRALES DE VENTE: Merci d'avoir commandé sur notre site de reproduction en ligne. Vos documents seront reproduits avec soin. En cas de retard de paiement, des pénalités pourront être appliquées.";
    const conditionsLines = doc.splitTextToSize(conditions, 180);
    doc.text(conditionsLines, 105, currentY, { align: 'center' });
    currentY += conditionsLines.length * 5;
    doc.text("Bonne journée.", 105, currentY, { align: 'center' });

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

  // Affichage des commandes dans l'ordre décroissant (inversion de l'ordre d'affichage)
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
                {/* Affichage du produit commandé */}
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Produit Commandé :
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2">
                    {Array.isArray(commande.cle)
                      ? commande.cle.join(', ')
                      : commande.cle || 'Non renseigné'}
                  </Typography>
                  {commande.isCleAPasse && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      (Clé à passe)
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Affichage des informations client */}
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'green.700', mb: 1 }}>
                  Informations Client :
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'green.800' }}>
                    {commande.nom}
                  </Typography>
                  {/* Affichage du numéro de commande */}
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>
                    Numéro de commande : {commande.numeroCommande || "Non renseigné"}
                  </Typography>
                  {/* Affichage de la date de commande enregistrée dans la base de données */}
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'green.700', mt: 1 }}>
                    Date de commande :{" "}
                    {commande.dateCommande
                      ? new Date(commande.dateCommande).toLocaleDateString()
                      : "Non renseignée"}
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
                        {/* Affichage inconditionnel du champ Ville sous forme d'input en lecture seule */}
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
                  {commande.quantity && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                        Quantité de copies :
                      </Typography>
                      <Typography variant="body1">{commande.quantity}</Typography>
                    </Box>
                  )}
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
