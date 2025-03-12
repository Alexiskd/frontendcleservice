// DisplayNewUrl.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { redirections } from './redirections';

function DisplayNewUrl() {
  const location = useLocation();
  const fullPath = location.pathname + location.search;
  const newUrl = redirections[fullPath];

  return (
    <div>
      { newUrl ? (
        <>
          <p>Nouvelle URL pour ce chemin :</p>
          <pre>{newUrl}</pre>
          {/* Vous pouvez aussi proposer un lien cliquable */}
          <p>
            <a href={newUrl} target="_blank" rel="noopener noreferrer">
              Accéder à cette URL
            </a>
          </p>
        </>
      ) : (
        <p>Aucune nouvelle URL associée à ce chemin.</p>
      )}
    </div>
  );
}

export default DisplayNewUrl;
