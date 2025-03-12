import React from 'react';
import { Box, Typography } from '@mui/material';

const PhoneNumber = () => {
  return (
    <>
      {/* Définition de l'animation laser */}
      <style>
        {`
          @keyframes laser {
            0% {
              left: -100%;
            }
            50% {
              left: 100%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
      <Box sx={{ height: '85px' }} />
      <Box sx={{ backgroundColor: "#01591f", width: "100%", height: '35px' }}>
        <Typography
          component="h2"
          gutterBottom
          sx={{
            fontFamily: 'Lato, sans-serif',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: "#e0e0e0",
            py: 0,
          }}
        >
          Si vous avez des questions ou besoin d'assistance pour passer commande, appelez le&nbsp;
          <Box
            component="a"
            href="tel:0142674861"
            sx={{
              color: 'red',
              fontFamily: 'Lato, sans-serif',
              position: 'relative',
              display: 'inline-block',
              overflow: 'hidden',
              textDecoration: 'none',
              padding: '0 2px',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent)',
                animation: 'laser 2s linear infinite',
                borderRadius: '2px',
              },
            }}
          >
            01 42 67 48 61
          </Box>
        </Typography>
      </Box>
    </>
  );
};

export default PhoneNumber;
