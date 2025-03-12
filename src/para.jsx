import React from 'react';

const Para = () => {
  // Styles pour le conteneur
  const stylesConteneur = {
    position: 'fixed',
    bottom: '1%',
    left: 0,
    color: '#312E8C',
    padding: '10px',
    width:'5.5%',
    height:'6%',
    fontSize:'50%',
    textAlign: 'center',
  };

  const stylesLien = {
    color: '#312E8C',
    textDecoration: 'underline',
  };

  return (
    <div style={stylesConteneur}>
      Réalisé par <a href="https://www.juniorisep.com/" target="_blank" rel="noopener noreferrer" style={stylesLien}>Junior ISEP</a>
    </div>
  );
};

export default Para;
