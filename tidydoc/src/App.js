import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Import de React Router
import './App.css';
import heroImage from './assets/hero-image.jpeg';
import Services from './Services'; // Import de ton composant Services

function App() {
  // Utilisation de useState pour contrôler la visibilité de la vidéo
  const [showVideo, setShowVideo] = useState(false);

  // Fonction pour basculer l'état de la vidéo (afficher/masquer)
  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  return (
    <Router> {/* Enveloppe ton application avec Router */}
      <div className="App">
        {/* Header / NavBar */}
        <header className="header">
          <nav>
            <div className="logo">
              <h1>TidyDoc</h1>
            </div>
            <ul className="nav-links">
              <li><Link to="/">Accueil</Link></li> {/* Lien vers la page d'accueil */}
              <li><Link to="/services">Services</Link></li> {/* Lien vers la page Services */}
            </ul>
          </nav>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={(
            <div>
              {/* Hero Section */}
              <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-text">
                  <h2>Simplifiez votre gestion documentaire avec l'IA</h2>
                  <p>Stockez, classifiez et retrouvez vos documents en quelques clics.</p>
                </div>
              </section>

                    {/* Services Section */}
      <section className="service-info" id="services">
        <h2>Comment fonctionne TidyDoc ?</h2>
        <p>Notre solution utilise l'intelligence artificielle pour analyser, classer et organiser vos documents de manière sécurisée et efficace.</p>
        <p>Finis les dossiers mal organisés et les recherches interminables. TidyDoc s'occupe de tout !</p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">📄</div>
            <h3>Classement Automatique</h3>
            <p>Notre IA reconnaît et classe vos documents par catégorie, date et importance.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <h3>Recherche Intelligente</h3>
            <p>Retrouvez n'importe quel document en quelques secondes grâce à notre moteur de recherche avancé.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Sécurité Garantie</h3>
            <p>Vos données sont chiffrées et protégées selon les normes les plus strictes.</p>
          </div>
        </div>
      </section>

              {/* CTA Section */}
              <section className="demo-btn">
                <h2>Prêt à simplifier votre gestion documentaire ?</h2>
                <button onClick={toggleVideo}>
                  {showVideo ? 'Masquer la démo' : 'Voir la démo'}
                </button>

                {/* Affichage conditionnel de la vidéo */}
                {showVideo && (
                  <div className="video-container">
                    <video 
                      width="560" 
                      height="315" 
                      controls
                    >
                      <source src="/assets/demo-video.webm" type="video/mp4" />
                      Désolé, votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  </div>
                )}
              </section>
            </div>
          )} />
          <Route path="/services" element={<Services />} /> {/* Ajoute la route pour la page Services */}
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>TidyDoc</h2>
              <p>Simplifiez votre gestion documentaire avec l'IA</p>
            </div>
            <div className="footer-links">
              <h3>Liens rapides</h3>
              <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/services">Services</Link></li>
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
      </div>
    </Router>
  );
}

export default App;
