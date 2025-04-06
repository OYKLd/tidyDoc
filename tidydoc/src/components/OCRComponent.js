import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRComponent = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setLoading(true);

      const reader = new FileReader();
      reader.onload = () => {
        Tesseract.recognize(reader.result, 'fra')  // 'fra' pour français
          .then(({ data: { text } }) => {
            setText(text);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Erreur OCR :", error);
            setLoading(false);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h2>Analyse OCR</h2>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {loading ? <p>Analyse en cours...</p> : <p>Texte extrait : {text}</p>}
    </div>
  );
};

export default OCRComponent;
