// Navigation.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  background-color: #333;
  padding: 1rem;
`;

const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-right: 1rem;
  margin-bottom: 0.5rem;

  a {
    color: #fff;
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Navigation = () => {
  return (
    <NavContainer>
      <NavList>
        <NavItem>
          <Link to="/">Accueil (Login)</Link>
        </NavItem>
        <NavItem>
          <Link to="/index.php">Index.php (Login)</Link>
        </NavItem>
        <NavItem>
          <Link to="/trouvez.php">Catalogue</Link>
        </NavItem>
        <NavItem>
          <Link to="/catalogue-cles-coffre.php">Coffre Fort</Link>
        </NavItem>
        <NavItem>
          <Link to="/catalogue-telecommandes.php">Télécommandes</Link>
        </NavItem>
        <NavItem>
          <Link to="/badges.php">Badges</Link>
        </NavItem>
        {/* Routes pointant vers ServiceRedirect */}
        <NavItem>
          <Link to="/services.php">Services</Link>
        </NavItem>
        <NavItem>
          <Link to="/cle/double-de-cle.html">Double de Clé</Link>
        </NavItem>
        <NavItem>
          <Link to="/zone.php">Zone</Link>
        </NavItem>
        <NavItem>
          <Link to="/paiement_devis.php">Paiement Devis</Link>
        </NavItem>
        <NavItem>
          <Link to="/recherche.php">Recherche</Link>
        </NavItem>
        <NavItem>
          <Link to="/contact.php">Contact</Link>
        </NavItem>
        <NavItem>
          <Link to="/commande-success">Commande Success</Link>
        </NavItem>
        <NavItem>
          <Link to="/commande-cancel">Commande Cancel</Link>
        </NavItem>
        <NavItem>
          <Link to="/devis.php">Devis</Link>
        </NavItem>
        <NavItem>
          <Link to="/qui.php">À Propos</Link>
        </NavItem>
        <NavItem>
          <Link to="/commande-panier">Commande Panier</Link>
        </NavItem>
        <NavItem>
          <Link to="/upload-multiple">Upload Multiple</Link>
        </NavItem>
        <NavItem>
          <Link to="/politique-confidentialite">Politique Confidentialité</Link>
        </NavItem>
        <NavItem>
          <Link to="/mentions-legales">Mentions Légales</Link>
        </NavItem>
        <NavItem>
          <Link to="/conditions-generales">Conditions Générales</Link>
        </NavItem>
        {/* Optionnel : lien vers l'espace admin */}
        <NavItem>
          <Link to="/app">Espace Admin</Link>
        </NavItem>
      </NavList>
    </NavContainer>
  );
};

export default Navigation;
