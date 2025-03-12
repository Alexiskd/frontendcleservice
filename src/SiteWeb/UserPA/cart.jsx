import React, { useState, useContext } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { IconButton, Badge, Menu, MenuItem, Typography, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

// Styles globaux
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #f8f9fa;
  }
`;

// Conteneur du Cart
const CartWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 15px;
`;

// Style personnalisé pour le Menu de MUI
const StyledMenu = styled(Menu)`
  && .MuiPaper-root {
    max-height: 300px;
    width: 250px;
    border-radius: 8px;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
  }
`;

// Style d'un item du panier (chaque ligne)
const CartMenuItem = styled(MenuItem)`
  && {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    gap: 4px;
  }
`;

// Style du bouton "Commander"
const CommanderButton = styled(Button)`
  && {
    width: 100%;
    margin-top: 8px;
    font-weight: 600;
    background-color: #025920;
    color: #fff;
    &:hover {
      background-color: #025920;
    }
  }
`;

// Style du bouton "Supprimer"
const RemoveButton = styled(Button)`
  && {
    font-size: 0.75rem;
    padding: 4px 8px;
    background-color: #dc3545;
    color: #fff;
    margin-top: 4px;
    text-transform: none;
    &:hover {
      background-color: #c82333;
    }
  }
`;

const Cart = ({ onCartClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Récupération du panier et de la fonction de suppression depuis le contexte
  const { cartItems, removeFromCart } = useContext(CartContext);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Redirection vers la page de commande-panier
  const handleCommander = () => {
    navigate('/commande-panier');
  };

  // Pour supprimer UN SEUL article
  const handleRemoveItem = (item) => {
    removeFromCart(item.nom_article);
  };

  return (
    <>
      <GlobalStyle />

      <CartWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <IconButton color="inherit" onClick={onCartClick}>
          <Badge badgeContent={cartItems.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        <StyledMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMouseLeave}
          MenuListProps={{
            onMouseLeave: handleMouseLeave,
          }}
        >
          {cartItems.length > 0
            ? [
                // Transformation des items en tableau d'éléments
                ...cartItems.map((item, index) => (
                  <CartMenuItem key={index}>
                    <Typography variant="body1">
                      {item.nom_article || item.name || 'Nom Indéfini'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {item.quantite || 1} x {item.price ? `${item.price} €` : 'Prix non défini'}
                    </Typography>

                    <RemoveButton onClick={() => handleRemoveItem(item)}>
                      Supprimer
                    </RemoveButton>
                  </CartMenuItem>
                )),
                // Ajout du bouton "Commander"
                <MenuItem disableGutters key="commander">
                  <CommanderButton onClick={handleCommander}>
                    Commander
                  </CommanderButton>
                </MenuItem>
              ]
            : (
              <CartMenuItem>
                <Typography variant="body2" color="text.secondary">
                  Votre panier est vide.
                </Typography>
              </CartMenuItem>
            )
          }
        </StyledMenu>
      </CartWrapper>
    </>
  );
};

export default Cart;
