// Telecomande.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Telecomande = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige vers la page d'accueil dès que le composant est monté
    navigate('/');
  }, [navigate]);

  // Le composant ne rend rien puisque la redirection s'effectue immédiatement
  return null;
};

export default Telecomande;
