// AppAdmin/Messages.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Container principal avec fond blanc et texte sombre
const ContainerBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff', // fond blanc
  minHeight: '100vh',
  padding: theme.spacing(4),
  color: '#333333', // texte sombre
}));

// Titre stylisé avec Montserrat et accent vert
const TitleTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  color: '#4caf50', // vert accent
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

// Papier pour chaque message avec fond très clair, bordure accentuée et design moderne
const MessagePaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#f9f9f9', // blanc cassé
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderLeft: '5px solid #4caf50', // barre accent en vert
}));

// Divider personnalisé en vert
const DividerStyled = styled(Divider)(({ theme }) => ({
  backgroundColor: '#4caf50',
  margin: theme.spacing(1, 0),
}));

// Texte pour la date en gris moyen
const MessageCaption = styled(Typography)(({ theme }) => ({
  color: '#777777',
  fontFamily: 'Roboto, sans-serif',
}));

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Utilisation de la variable d'environnement VITE_API_URL (à définir dans .env)
  const API_URL = import.meta.env.VITE_API_URL || 'https://cl-back.onrender.com';

  useEffect(() => {
    fetch(`${API_URL}/contact-messages`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! statut: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des messages :', error);
        setLoading(false);
      });
  }, [API_URL]);

  if (loading) {
    return (
      <ContainerBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#4caf50' }} />
      </ContainerBox>
    );
  }

  return (
    <ContainerBox>
      <TitleTypography variant="h4" gutterBottom>
        Messages de Contact
      </TitleTypography>

      {messages.length === 0 ? (
        <Typography variant="h6" align="center">
          Aucun message trouvé.
        </Typography>
      ) : (
        // On crée une copie inversée pour afficher le plus récent en premier
        {[...messages].reverse().map((msg) => (
          <MessagePaper key={msg.id}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}
            >
              {msg.name} (<em style={{ color: '#777777' }}>{msg.email}</em>)
            </Typography>

            <DividerStyled />

            <Typography
              variant="body1"
              sx={{ fontFamily: 'Roboto, sans-serif', color: '#333333' }}
            >
              {msg.message}
            </Typography>

            <MessageCaption variant="caption">
              Envoyé le {new Date(msg.createdAt).toLocaleString()}
            </MessageCaption>
          </MessagePaper>
        )))
      )}
    </ContainerBox>
  );
};

export default Messages;


