import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Les styles ci‑dessous s'appliqueront uniquement aux éléments qui se trouvent dans un conteneur ayant la classe "app" */
  .app * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .app {
    font-family: 'Montserrat', sans-serif;
    background-color: #ffffff;
    color: #333333;
    line-height: 1.6;
  }

  .app a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s ease;
  }

  .app a:hover {
    color: rgb(0, 179, 63);
  }

  /* Personnalisation de la scrollbar pour les navigateurs basés sur Webkit (Chrome, Safari, Edge) */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #025920, #76b947);
    border-radius: 6px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #004e16, #5e8e35);
  }
  
  /* Personnalisation de la scrollbar pour Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #76b947 #f1f1f1;
  }
`;

export default GlobalStyle;
