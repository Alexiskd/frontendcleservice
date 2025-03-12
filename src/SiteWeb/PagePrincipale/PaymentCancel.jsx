import React from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          borderRadius: 2,
          width: '100%',
        }}
      >
        <Typography variant="h5" sx={{ color: 'error.main', mb: 2, fontWeight: 'bold' }}>
          Paiement refusé !
        </Typography>
        <Typography variant="body1" sx={{ color: 'error.main', mb: 4 }}>
          Votre paiement a été refusé. Veuillez réessayer ou contacter le support pour plus d'informations.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentCancel;
