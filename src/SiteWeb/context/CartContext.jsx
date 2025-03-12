import React, { createContext, useState, useEffect } from 'react';

// Création du contexte
export const CartContext = createContext();

// Fournisseur du contexte
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('localCart')) || [];
    setCartItems(localCart);
  }, []);

  // Ajouter un article au panier (localStorage uniquement)
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const newCart = [...prevItems, item];
      localStorage.setItem('localCart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Supprimer un article du panier (localStorage uniquement) par nom_article
  const removeFromCart = (itemName) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter((item) => item.nom_article !== itemName);
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // Vider complètement le panier
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('localCart');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
