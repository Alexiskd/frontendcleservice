// AdminDashboard.jsx
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Barreadmin from './barreadmin.jsx';
import Ajoutez from './ajoutez.jsx';
import Commande from './commande.jsx';

const drawerWidth = 240;

const AdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barre de navigation latérale */}
      <Barreadmin />

      {/* Contenu principal centré */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          ml: `${drawerWidth}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="ajouter" element={<Ajoutez />} />
          
          {/* Vous pouvez ajouter d'autres routes ici */}
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
