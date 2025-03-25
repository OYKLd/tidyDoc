import React, { useState } from 'react';
import './Services.css'; // Assure-toi d'avoir un fichier CSS pour le style

const Services = () => {
  // Liste des catégories de documents
  const categories = [
    "Documents Administratifs",
    "Factures & Reçus",
    "Documents Financiers",
    "Contrats & Légaux",
    "Immobilier",
    "Véhicules",
    "Documents Professionnels",
    "Dossiers Médicaux",
    "Éducation & Académique",
    "Documents Personnels"
  ];

  // État pour afficher ou cacher les options du bouton "+"
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="services-container">
      {/* Titre de la page */}
      <h2>Catégories de Documents</h2>

      {/* Affichage des catégories dynamiquement */}
      <div className="categories">
        {categories.map((category, index) => (
          <div key={index} className="category">
            {category}
          </div>
        ))}
      </div>

      {/* Bouton + en bas à droite */}
      <div className="floating-button">
      <button onClick={() => setShowOptions(!showOptions)} className="plus-btn">
  {showOptions ? '×' : '+'}
</button>
        {showOptions && (
          <div className="options">
            <button className="option-btn">📷 Capture</button>
            <button className="option-btn">📂 Télécharger</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
