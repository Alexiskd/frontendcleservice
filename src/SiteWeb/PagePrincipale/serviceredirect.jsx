// ServiceRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige vers la page d'accueil dès le montage du composant
    navigate('/');
  }, [navigate]);

  return null; // Aucun rendu puisque la redirection s'effectue immédiatement
};

export default ServiceRedirect;
