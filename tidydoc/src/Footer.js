// src/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>TidyDoc</h2>
          <p>Simplifiez votre gestion documentaire avec l'IA</p>
        </div>

        <div className="footer-links">
          <h3>Liens rapides</h3>
          <ul>
            <li><a href="#home">Accueil</a></li>
            <li><a href="#services">Services</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contact</h3>
          <p>Email: contact@tidydoc.com</p>
          <p>WhatsApp: +225 123 456 789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 TidyDoc | Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Footer;
