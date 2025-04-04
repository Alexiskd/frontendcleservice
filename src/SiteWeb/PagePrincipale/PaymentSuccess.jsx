import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Container, Button, Paper } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const numeroCommande = searchParams.get('numeroCommande');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processOrder = async () => {
      if (!numeroCommande) {
        console.error("Erreur: Numéro de commande manquant.");
        setError('Numéro de commande manquant.');
        setLoading(false);
        return;
      }
      try {
        // 1. Validation de la commande
        console.log("Envoi de la requête de validation pour la commande:", numeroCommande);
        const validateResponse = await fetch(`https://cl-back.onrender.com/commande/validate/${numeroCommande}`, {
          method: 'PATCH',
        });
        console.log("Réponse de validation:", {
          status: validateResponse.status,
          ok: validateResponse.ok,
        });
        if (!validateResponse.ok) {
          throw new Error('Erreur lors de la validation de la commande.');
        }

        // 2. Récupération des informations de la commande par son numéro
        console.log("Envoi de la requête pour récupérer la commande:", numeroCommande);
        const orderResponse = await fetch(`https://cl-back.onrender.com/commande/${numeroCommande}`);
        console.log("Réponse de récupération de la commande:", {
          status: orderResponse.status,
          ok: orderResponse.ok,
        });
        if (!orderResponse.ok) {
          throw new Error("Erreur lors de la récupération de la commande.");
        }
        const orderData = await orderResponse.json();
        console.log("Données de la commande reçues:", orderData);
        setOrder(orderData);

        // 3. Envoi de l'email pour la commande validée en utilisant les infos de la commande
        const emailBody = {
          nom: orderData.nom,
          adresseMail: orderData.adresseMail,
          cle: orderData.cle,
          prix: parseFloat(orderData.prix),
          telephone: orderData.telephone,
          shippingMethod: orderData.shippingMethod,
          typeLivraison: orderData.typeLivraison,
        };

        console.log("Envoi de l'email avec le body suivant:", emailBody);
        const emailResponse = await fetch('https://cl-back.onrender.com/mail/confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailBody),
        });
        console.log("Réponse de l'envoi de l'email:", {
          status: emailResponse.status,
          ok: emailResponse.ok,
        });
        if (!emailResponse.ok) {
          throw new Error("Erreur lors de l'envoi de l'email.");
        }

        console.log("La commande est validée et l'email a été envoyé avec succès.");
        setValidated(true);
      } catch (err) {
        console.error("Erreur dans processOrder:", err);
        // Vérification si l'erreur concerne l'envoi de l'email
        if (err.message && err.message.includes("envoi de l'email")) {
          setError("Le mail n'a pas pu être envoyé à cause d'un problème dans nos services. Veuillez appeler le 01 42 67 48 61 pour obtenir des informations sur votre commande.");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [numeroCommande]);

  if (loading) {
    return (
      <Container
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Veuillez patienter, confirmation de la commande en cours...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

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
        {validated ? (
          <>
            <Typography variant="h5" sx={{ color: 'success.main', mb: 2, fontWeight: 'bold' }}>
              Paiement accepté !
            </Typography>
            <Typography variant="body1" sx={{ color: 'success.main', mb: 4 }}>
              Votre paiement a été accepté et la commande est validée. Un email contenant les informations de livraison vous a été envoyé.
            </Typography>
            {order && (
              <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                Retour à l'accueil
              </Button>
            )}
          </>
        ) : (
          <Typography variant="h5" color="error">
            Erreur lors de la validation de la commande.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
