import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LabelIcon from '@mui/icons-material/Label';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(27, 94, 32, 0.3)',
  transition: 'transform 0.3s',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1B5E20',
  color: '#fff',
  textTransform: 'none',
  padding: theme.spacing(1.5, 4),
  borderRadius: 4,
  boxShadow: 'none',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#155724',
  },
}));

const ProductPage = () => {
  // États et hooks restent inchangés

  return (
    <>
      <Helmet>
        {/* Meta et titres inchangés */}
      </Helmet>

      <Container sx={{ mt: 2, mb: 4 }}>
        <StyledCard>
          <Grid container spacing={2}>
            {/* Image et contenu restent inchangés */}

            <Grid item xs={12} md={8}>
              <CardContent>
                {/* Titres et infos produits inchangés */}

                <Divider sx={{ my: 2 }} />

                {/* Infobox inchangées */}

                <Box sx={{ mb: 2 }}>
                  <List>
                    {product.cleAvecCartePropriete !== null && (
                      <ListItem disableGutters>
                        <ListItemIcon><VpnKeyIcon color="action" /></ListItemIcon>
                        <ListItemText primary={`Carte de propriété : ${product.cleAvecCartePropriete ? 'Oui' : 'Non'}`} primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }} />
                      </ListItem>
                    )}
                    {product.referenceEbauche && (
                      <ListItem disableGutters>
                        <ListItemIcon><LabelIcon color="action" /></ListItemIcon>
                        <ListItemText primary={`Référence ébauche : ${product.referenceEbauche}`} primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }} />
                      </ListItem>
                    )}
                    {product.typeReproduction && (
                      <ListItem disableGutters>
                        <ListItemIcon><FileCopyIcon color="action" /></ListItemIcon>
                        <ListItemText primary={`Mode de reproduction : ${product.typeReproduction}`} primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }} />
                      </ListItem>
                    )}
                    {product.descriptionNumero && product.descriptionNumero.trim() !== '' && (
                      <ListItem disableGutters>
                        <ListItemIcon><FormatListNumberedIcon color="action" /></ListItemIcon>
                        <ListItemText primary={`Détails du numéro : ${product.descriptionNumero}`} primaryTypographyProps={{ fontFamily: 'Bento, sans-serif' }} />
                      </ListItem>
                    )}
                  </List>
                </Box>

                {/* Boutons de commande inchangés */}

              </CardContent>
            </Grid>
          </Grid>
        </StyledCard>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Container>

      <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="lg">
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={modalImage}
              alt={product.nom}
              style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductPage;
