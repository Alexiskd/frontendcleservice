// src/PagePrincipale/tuto.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

// Overlay pour le popup
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 1rem;
`;

// Popup avec animation
const Popup = styled(motion.div)`
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 40rem;
  position: relative;
`;

// Bouton pour fermer le popup
const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: #6b7280;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #1f2937;
  }
`;

// En-tête du popup
const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    color: #025920;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    color: #4b5563;
  }
`;

// Conteneur des boutons "Précédent" et "Suivant/Terminer"
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;

// Bouton utilisé dans le popup
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  transition: background-color 0.3s;
  background-color: ${(props) => (props.disabled ? "#D1D5DB" : "#025920")};
  color: white;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "#D1D5DB" : "#034e2e"};
  }
`;

// Indicateurs de progression
const Indicators = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;

  span {
    height: 0.75rem;
    width: 0.75rem;
    border-radius: 9999px;
    transition: background-color 0.3s;
    background-color: ${(props) =>
      props.active ? "#025920" : "rgba(2, 89, 32, 0.4)"};
  }
`;

// Bouton flottant positionné en bas à gauche
const FloatingButton = styled.button`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  padding: 0.75rem 1rem;
  background-color: #025920;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.9rem;
  cursor: pointer;
  z-index: 60;
  transition: background-color 0.3s;

  &:hover {
    background-color: #034e2e;
  }
`;

// Composant affichant le contenu du popup (le tutoriel)
const TutorialContent = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "Bienvenue sur cleService.com ! Nous proposons plusieurs méthodes pour copier vos clés de manière rapide, sécurisée et adaptée à vos besoins spécifiques.",
    "Pour certaines clés équipées d'un numéro de copie, il vous suffit de nous fournir ce numéro. Notre équipe se charge alors de dupliquer votre clé avec précision et fiabilité.",
    "Pour les clés sans numéro de copie, vous devrez nous les envoyer. Nous les copierons et vous les renverrons via Chronopost ou en recommandé, les deux options étant tout aussi sécurisées pour votre tranquillité d'esprit.",
  ];

  const totalSteps = slides.length - 1;
  const isStep = currentSlide > 0;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Overlay>
      <Popup
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <CloseButton onClick={onClose} aria-label="Fermer">
          &times;
        </CloseButton>

        <Header>
          {isStep ? (
            <h2>{`Étape ${currentSlide} sur ${totalSteps}`}</h2>
          ) : (
            <h2>Bienvenue sur cleService.com !</h2>
          )}
          <p>{slides[currentSlide]}</p>
        </Header>

        <ButtonContainer>
          <Button onClick={prevSlide} disabled={currentSlide === 0}>
            Précédent
          </Button>
          <Button onClick={nextSlide}>
            {currentSlide < slides.length - 1 ? "Suivant" : "Terminer"}
          </Button>
        </ButtonContainer>

        <Indicators>
          {slides.map((_, index) => (
            <span key={index} active={index === currentSlide}></span>
          ))}
        </Indicators>
      </Popup>
    </Overlay>
  );
};

// Composant principal qui gère l'ouverture/fermeture du popup
const TutorialPopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      {isPopupOpen && <TutorialContent onClose={closePopup} />}
      <FloatingButton onClick={openPopup}>
        Appuyez ici pour comprendre comment commander votre clé simplement
      </FloatingButton>
    </>
  );
};

export default TutorialPopup;
