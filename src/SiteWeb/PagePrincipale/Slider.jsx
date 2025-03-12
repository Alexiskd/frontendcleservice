import React from 'react';

// Importation des images
import ABUS_Logo from './Marque/ABUS_Logo.jpg';
import Anker_Logo from './Marque/Anker_Logo.png';
import Deny_Logo from './Marque/deny_logo.jpeg';
import Errebi from './Marque/errebi.jpeg';
import Fichet_Logo from './Marque/fichet_logo.jpeg';
import FTH_Logo from './Marque/fth_logo.jpeg';
import Heracles_Logo from './Marque/heracles_logo.jpeg';
import Medeco_Logo from './Marque/medeco_logo.jpeg';
import Muel_Logo from './Marque/muel_logo.jpeg';
import Multilock_Logo from './Marque/multilock_logo.jpeg';
import Pollux_Logo from './Marque/pollux_logo.jpeg';
import Ronis_Logo from './Marque/ronis_logo.jpeg';
import Silca_Logo from './Marque/silca_logo.jpeg';
import Tesa_Logo from './Marque/tesa_logo.jpeg';
import Vachette_Logo from './Marque/vachette_logo.jpg';

// Tableau des images
const images = [
  ABUS_Logo,
  Anker_Logo,
  Deny_Logo,
  Errebi,
  Fichet_Logo,
  FTH_Logo,
  Heracles_Logo,
  Medeco_Logo,
  Muel_Logo,
  Multilock_Logo,
  Pollux_Logo,
  Ronis_Logo,
  Silca_Logo,
  Tesa_Logo,
  Vachette_Logo
];

const Slider = () => {
  const sliderStyle = {
    background: 'white',
    boxShadow: '0 10px 20px -5px rgba(0, 0, 0, .125)',
    height: '100px',
    margin: 'auto',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  };

  const slideTrackStyle = {
    display: 'flex',
    animation: 'scroll 40s linear infinite',
    width: `calc(250px * ${images.length * 2})`,
  };

  const slideStyle = {
    height: '100px',
    width: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div style={sliderStyle}>
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
      <div style={slideTrackStyle}>
        {images.map((image, index) => (
          <div style={slideStyle} key={index}>
            <img
              src={image}
              alt={`Logo ${index + 1}`}
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>
        ))}
        {images.map((image, index) => (
          <div style={slideStyle} key={index + images.length}>
            <img
              src={image}
              alt={`Logo ${index + 1}`}
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
