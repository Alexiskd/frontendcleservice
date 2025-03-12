import React from 'react';
import { Box, Typography, Container, Button, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';


const AutreService = () => {
  return (
    <Box sx={{ backgroundColor: '#EDEDED', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <Box 
        style={{
          
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#FFFFFF',
          padding: '80px 0',
        }}
      >
        <Container>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '700' }}>
            Autres Services de CLE SERVICE
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ fontFamily: 'Roboto, sans-serif', color: '#FFFFFF', maxWidth: '600px', mx: 'auto' }}>
            Découvrez notre large gamme de solutions de serrurerie, adaptées à tous vos besoins de sécurité.
          </Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Container sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{
            backgroundColor: '#FFFFFF',
            padding: 5,
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '800px'
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600', mb: 3 }}>
            Nos Services de Serrurerie
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
            En fonction de vos besoins, nous vous proposons toute une gamme de serrures, verrous et cylindres de toutes marques, adaptables sur tous types de portes : bois, aluminium, verre...
          </Typography>
          
          {/* List of Services */}
          <List sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            {['Nouveaux locaux', 'Perte de clés', 'Vol de clés', 'Effraction du cylindre', 'Renforcement de la sécurité'].map((service, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ArrowRightIcon sx={{ color: '#025920' }} />
                </ListItemIcon>
                <ListItemText primary={service} primaryTypographyProps={{ sx: { fontFamily: 'Roboto, sans-serif', fontWeight: '500', color: '#333' } }} />
              </ListItem>
            ))}
          </List>

          {/* Buttons Section */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" sx={{ bgcolor: '#025920', '&:hover': { bgcolor: '#024514' } }}>
              Prendre rendez-vous pour un devis
            </Button>
            <Button variant="outlined" color="primary" sx={{ color: '#025920', borderColor: '#025920', '&:hover': { borderColor: '#024514', color: '#024514' } }}>
              Devis en ligne
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ color: '#025920', mt: 4, fontStyle: 'italic' }}>
            Plans de combinaisons permettant l’ouverture de plusieurs serrures avec la même clé, avec possibilité de restreindre l’accès.
          </Typography>
          <Typography variant="body2" sx={{ color: '#025920', textDecoration: 'underline', cursor: 'pointer', mt: 1 }}>
            Voir exemple &gt; cliquez-ici
          </Typography>
        </Box>
      </Container>

      
    </Box>
  );
};

export default AutreService;
