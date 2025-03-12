import React, { useState } from 'react';

const MultiImageTuples = () => {
  const [images, setImages] = useState([]);
  const [copied, setCopied] = useState(false);

  // Gère la sélection de fichiers et leur conversion en Data URL (base64)
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            fileName: file.name,
            dataUrl: reader.result,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((results) => {
        setImages(results);
      })
      .catch((error) => {
        console.error('Erreur lors de la lecture des fichiers :', error);
      });
  };

  // Génère la liste des tuples sous forme de texte
  // Chaque tuple est au format : (numero, "nom de la clé", "chaine")
  const generateTuples = () => {
    return images
      .map((img, index) => `(${index + 1}, "${img.fileName}", "${img.dataUrl}")`)
      .join(",\n");
  };

  // Copie le contenu généré dans le presse-papiers
  const handleCopy = () => {
    const text = generateTuples();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Erreur lors de la copie :", err));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',       // Centre horizontalement
        justifyContent: 'center',   // Centre verticalement
        minHeight: '100vh',         // Prend toute la hauteur de la fenêtre
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h2>Uploader plusieurs images et générer des tuples</h2>
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleFilesChange} 
      />
      {images.length > 0 && (
        <div style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
          <h3>Liste des tuples :</h3>
          <textarea
            readOnly
            value={generateTuples()}
            rows={Math.min(images.length * 2, 10)}
            style={{
              width: '100%',
              padding: '10px',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
          <button 
            onClick={handleCopy} 
            style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Copier
          </button>
          {copied && <p style={{ color: 'green', marginTop: '10px' }}>Copié !</p>}
        </div>
      )}
    </div>
  );
};

export default MultiImageTuples;
