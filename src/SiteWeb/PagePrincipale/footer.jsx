import React, { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

// Mixin pour le texte en dégradé
const gradientText = css`
  background: linear-gradient(90deg, #15720a, #000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// Container principal du footer
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #f4f4cc, #1B5E20);
  padding: 4rem 2rem;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
    border-radius: 10px;
  }
`;

// Grille pour centrer les sections
const FooterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
`;

// Section individuelle avec délai d'apparition
const FooterSection = styled.div`
  flex: 1 1 280px;
  max-width: 320px;
  text-align: center;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.8s ease-out ${props => props.$delay || '0s'},
              transform 0.8s ease-out ${props => props.$delay || '0s'};

  @media (max-width: 768px) {
    flex: 1 1 100%;
    max-width: none;
  }
`;

// Titres de section avec dégradé
const FooterTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  ${gradientText}
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 70px;
    height: 3px;
    ${gradientText}
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    &::after {
      width: 50px;
    }
  }
`;

// Texte de contenu
const FooterText = styled.p`
  font-size: 0.9rem;
  line-height: 1.8;
  opacity: 0.9;
  ${gradientText}

  a {
    ${gradientText}
    text-decoration: underline;
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

// Liens utiles
const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  a {
    ${gradientText}
    text-decoration: none;
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      transform: translateY(-3px);
    }
  }
`;

// Boutons des réseaux sociaux
const SocialIcon = styled.a`
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.8s ease-out ${props => props.$delay || '0s'},
              transform 0.8s ease-out ${props => props.$delay || '0s'},
              background 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  svg {
    color: #000;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }
`;

// Conteneur pour les icônes sociales
const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2.5rem 0;

  @media (max-width: 768px) {
    margin: 2rem 0;
    gap: 0.8rem;
  }
`;

// Bas de page (copyright)
const FooterBottom = styled.div`
  text-align: center;
  font-size: 0.8rem;
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  padding-top: 1rem;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.8s ease-out 1s, transform 0.8s ease-out 1s;
  ${gradientText}

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const Footer = () => {
  // Référence du container pour observer son apparition dans le viewport
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <FooterContainer ref={containerRef} $visible={visible}>
      <FooterGrid>
        {/* Coordonnées */}
        <FooterSection $delay="0.2s" $visible={visible}>
          <FooterTitle>Maison Bouvet - Clé Service</FooterTitle>
          <FooterText>
            20 Rue Lévis, 75017 Paris <br />
            Tél : <strong>01 42 67 48 61</strong> <br />
            <a href="mailto:contact@cleservice.com">contact@cleservice.com</a> <br />
            Du lundi au samedi : 8h30 – 12h30 / 14h – 18h
          </FooterText>
        </FooterSection>

        {/* Liens utiles */}
        <FooterSection $delay="0.4s" $visible={visible}>
          <FooterTitle>Liens Utiles</FooterTitle>
          <FooterLinks>
            <a href="/mentions-legales">Mentions Légales</a>
            <a href="/politique-confidentialite">Politique de Confidentialité</a>
            <a href="/conditions-generales">Conditions Générales</a>
          </FooterLinks>
        </FooterSection>

        {/* Informations légales */}
        <FooterSection $delay="0.6s" $visible={visible}>
          <FooterTitle>Informations Légales</FooterTitle>
          <FooterText>
            Maison Bouvet S.A.S. <br />
            RCS : <strong>500 188 339</strong> <br />
            TVA : <strong>FR55500188339</strong>
          </FooterText>
        </FooterSection>
      </FooterGrid>

      {/* Réseaux sociaux */}
      <SocialIcons>
        <SocialIcon
          href="https://www.facebook.com/cleservice"
          target="_blank"
          rel="noopener noreferrer"
          $delay="0.8s"
          $visible={visible}
        >
          <FaFacebookF />
        </SocialIcon>
        <SocialIcon
          href="https://www.instagram.com/cleservice_com/"
          target="_blank"
          rel="noopener noreferrer"
          $delay="1s"
          $visible={visible}
        >
          <FaInstagram />
        </SocialIcon>
        <SocialIcon
          href="https://x.com/AlexisB61561444"
          target="_blank"
          rel="noopener noreferrer"
          $delay="1.2s"
          $visible={visible}
        >
          <FaTwitter />
        </SocialIcon>
      </SocialIcons>

      {/* Copyright */}
      <FooterBottom $visible={visible}>
        © {new Date().getFullYear()} Maison Bouvet - Tous droits réservés.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
