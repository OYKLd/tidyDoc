import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import heroImage from './assets/hero-image.jpeg';
import Services from './Services';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from './AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { FaGoogle, FaWhatsapp } from 'react-icons/fa';

function Navigation() {
  const { currentUser, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };
  

  return (
    <nav>
      <div className="logo">
        <h1>TidyDoc</h1>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/services">Services</Link></li>
        {isAuthenticated ? (
          <li>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

function Footer() {
  // Email pour Google/Gmail
  const emailAddress = "lydieouattara828@gmail.com";
  
  // Numéro de téléphone pour WhatsApp (format international)
  const phoneNumber = "+2250719749695";
  
  // Message pré-rempli pour WhatsApp
  const whatsappMessage = "Bonjour, je souhaite en savoir plus sur TidyDoc.";
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>TidyDoc</h3>
        <div className="social-icons">
          <a 
            href={`mailto:${emailAddress}`} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Envoyer un email"
          >
            <FaGoogle className="icon google-icon" />
          </a>
          <a 
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Contacter sur WhatsApp"
          >
            <FaWhatsapp className="icon whatsapp-icon" />
          </a>
        </div>
        <p className="slogan">Simplifiez votre gestion documentaire avec l'IA</p>
        <p className="copyright">Copyright | Rangement de document | 2025</p>
      </div>
    </footer>
  );
}

function App() {
  const [showVideo, setShowVideo] = useState(false);

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <header className="header">
            <Navigation />
          </header>

          <Routes>
            <Route path="/" element={(
              <div>
                <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
                  <div className="hero-text">
                    <h2>Simplifiez votre gestion documentaire avec l'IA</h2>
                    <p>Stockez, classifiez et retrouvez vos documents en quelques clics.</p>
                  </div>
                </section>

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

                <section className="demo-btn">
                  <h2>Prêt à simplifier votre gestion documentaire ?</h2>
                  <button onClick={toggleVideo}>
                    {showVideo ? 'Masquer la démo' : 'Voir la démo'}
                  </button>

                  {showVideo && (
                    <div className="video-container">
                      <video 
                        width="560" 
                        height="315" 
                        controls
                      >
                        <source src="/assets/demo-video.mp4" type="video/mp4" />
                        Désolé, votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    </div>
                  )}
                </section>
              </div>
            )} />
            
            <Route 
              path="/services" 
              element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
          {/* Utiliser le composant Footer ici au lieu du code en dur */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;