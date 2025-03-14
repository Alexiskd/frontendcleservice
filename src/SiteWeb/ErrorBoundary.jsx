// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI de secours
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de reporting
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      // Vous pouvez personnaliser l'affichage en cas d'erreur
      return <h1>Quelque chose s'est mal passé.</h1>;
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
