import './Services.css'
import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, Search, Download, Share2, Eye, Trash, LogOut } from 'lucide-react';
import Tesseract from 'tesseract.js';
// Importez vos fonctions Firebase Auth
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Assurez-vous que ce chemin est correct

const DocumentManagementApp = () => {
  // Document categories
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

  // State management
  const [showOptions, setShowOptions] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [viewingDocument, setViewingDocument] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const fileInputRef = useRef(null);
  
  // États pour la caméra
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // IndexedDB setup
  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Si l'utilisateur est connecté, initialiser/ouvrir sa base de données personnelle
        initializeUserDB(user.uid);
      } else {
        // Si aucun utilisateur n'est connecté, réinitialiser les documents et l'état de la DB
        setDocuments([]);
        setDbInitialized(false);
      }
    });

    return () => {
      // Cleanup de l'effet et arrêt de la caméra si elle est active
      unsubscribe();
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialisation de la base de données pour l'utilisateur
  const initializeUserDB = (userId) => {
    const request = indexedDB.open(`user_docs_${userId}`, 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Créer un object store pour les documents
      if (!db.objectStoreNames.contains('documents')) {
        const store = db.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('dateAdded', 'dateAdded', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log("Database initialized for user:", userId);
      setDbInitialized(true);
      
      // Charger les documents de l'utilisateur
      loadUserDocuments(db);
    };
  };

  // Charger les documents depuis IndexedDB
  const loadUserDocuments = (db) => {
    const transaction = db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    const request = store.getAll();

    request.onsuccess = (event) => {
      const loadedDocs = event.target.result;
      console.log("Documents loaded:", loadedDocs);
      
      // Créer les Blob URLs pour les documents chargés
      const docsWithBlobUrls = loadedDocs.map(doc => {
        // Si le document a des données binaires stockées
        if (doc.fileData) {
          const blob = new Blob([doc.fileData], { type: doc.fileType });
          doc.fileBlob = URL.createObjectURL(blob);
        }
        return doc;
      });
      
      setDocuments(docsWithBlobUrls);
    };

    request.onerror = (event) => {
      console.error("Error loading documents:", event.target.error);
    };
  };

  // Sauvegarder un document dans IndexedDB
  const saveDocument = async (document) => {
    if (!currentUser || !dbInitialized) return;

    try {
      // Récupérer les données binaires du fichier depuis l'URL Blob
      const response = await fetch(document.fileBlob);
      const fileData = await response.arrayBuffer();
      
      // Créer un objet document avec les données binaires
      const docToSave = {
        ...document,
        fileData, // Données binaires du fichier
        // Ne pas inclure fileBlob car c'est une URL qui n'est pas sérialisable et sera recréée au chargement
      };

      // Supprimer la propriété fileBlob avant la sauvegarde
      delete docToSave.fileBlob;

      const request = indexedDB.open(`user_docs_${currentUser.uid}`, 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['documents'], 'readwrite');
        const store = transaction.objectStore('documents');
        
        store.put(docToSave);
        
        transaction.oncomplete = () => {
          console.log("Document saved successfully");
        };
        
        transaction.onerror = (event) => {
          console.error("Error saving document:", event.target.error);
        };
      };
    } catch (error) {
      console.error("Error processing document for save:", error);
    }
  };

  // Supprimer un document de IndexedDB
  const deleteDocumentFromDB = (docId) => {
    if (!currentUser || !dbInitialized) return;
    
    const request = indexedDB.open(`user_docs_${currentUser.uid}`, 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      
      store.delete(docId);
      
      transaction.oncomplete = () => {
        console.log("Document deleted successfully");
      };
      
      transaction.onerror = (event) => {
        console.error("Error deleting document:", event.target.error);
      };
    };
  };

  // Document analysis functions
  const analyzeDocumentContent = (text) => {
    // Mots-clés pour chaque catégorie
    const keywordCategories = {
      "Documents Administratifs": ["administration", "administrative", "certificat", "attestation", "déclaration", "préfecture", "mairie"],
      "Factures & Reçus": ["facture", "reçu", "paiement", "total", "ht", "ttc", "montant", "€", "euro", "euros", "achat", "client"],
      "Documents Financiers": ["banque", "compte", "relevé", "virement", "crédit", "débit", "épargne", "placement", "bourse", "action"],
      "Contrats & Légaux": ["contrat", "convention", "accord", "stipule", "signataire", "clause", "juridique", "légal", "engagement"],
      "Immobilier": ["bail", "loyer", "propriété", "immobilier", "logement", "appartement", "maison", "hypothèque", "foncier"],
      "Véhicules": ["voiture", "automobile", "véhicule", "immatriculation", "assurance auto", "carte grise", "permis", "kilométrage"],
      "Documents Professionnels": ["emploi", "travail", "salaire", "entreprise", "société", "professionnel", "carrière", "cv", "bulletin"],
      "Dossiers Médicaux": ["santé", "médical", "docteur", "médecin", "ordonnance", "traitement", "consultation", "remboursement", "mutuelle"],
      "Éducation & Académique": ["école", "université", "diplôme", "formation", "scolarité", "étudiant", "académique", "certificat"],
      "Documents Personnels": ["personnel", "identité", "passeport", "carte d'identité", "naissance", "familial", "privé"]
    };

    // Conversion du texte en minuscules pour la comparaison
    const lowerText = text.toLowerCase();
    
    // Attribution de points pour chaque catégorie
    const scores = {};
    
    for (const [category, keywords] of Object.entries(keywordCategories)) {
      scores[category] = 0;
      
      for (const keyword of keywords) {
        // Recherche du mot-clé dans le texte
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        
        if (matches) {
          // Attribuer plus de points pour les mots clés plus spécifiques
          scores[category] += matches.length * (keyword.length > 5 ? 2 : 1);
        }
      }
    }
    
    // Déterminer la catégorie avec le score le plus élevé
    let bestCategory = "Documents Personnels"; // Catégorie par défaut
    let highestScore = 0;
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }
    
    // Extraire quelques mots-clés
    const allWords = lowerText.match(/\b\w{4,}\b/g) || [];
    const wordFrequency = {};
    allWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Trier les mots par fréquence et prendre les plus courants comme mots-clés
    const keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Déterminer le type de document
    let documentType = "Autre";
    if (lowerText.includes("facture")) documentType = "Facture";
    else if (lowerText.includes("reçu")) documentType = "Reçu";
    else if (lowerText.includes("contrat")) documentType = "Contrat";
    else if (lowerText.includes("attestation")) documentType = "Attestation";
    else if (lowerText.includes("carte d'identité") || lowerText.includes("passeport")) documentType = "Pièce d'identité";
    
    return {
      documentType,
      suggestedCategory: bestCategory,
      keywords,
      confidence: highestScore
    };
  };

  // Document capture and processing
  const handleDocumentCapture = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;
    
    try {
      setIsProcessing(true);
      setProcessingStatus('Extraction du texte en cours...');
      
      // Create a blob URL for the file
      const fileBlob = URL.createObjectURL(file);
      
      // Use Tesseract.js for OCR
      let extractedText = '';
      
      if (file.type.includes('image')) {
        // OCR pour image
        const result = await Tesseract.recognize(
          file,
          'fra', // langue française
          { 
            logger: m => {
              if (m.status === 'recognizing text') {
                setProcessingStatus(`Reconnaissance de texte: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );
        extractedText = result.data.text;
      } else if (file.type === 'application/pdf') {
        // Pour les PDF, on pourrait intégrer pdf.js pour l'extraction
        setProcessingStatus('Extraction depuis PDF non implémentée dans cette démo');
        extractedText = "Texte simulé pour démonstration PDF";
      }
      
      setProcessingStatus('Analyse et catégorisation...');
      
      // Analyse du texte extrait
      const analysis = analyzeDocumentContent(extractedText);
      
      // Create document object
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        fileBlob: fileBlob,
        fileType: file.type,
        type: analysis.documentType,
        category: analysis.suggestedCategory,
        extractedText: extractedText,
        keywords: analysis.keywords,
        dateAdded: new Date().toISOString(),
        userId: currentUser.uid // Associer le document à l'utilisateur actuel
      };

      // Update documents state
      setDocuments(prev => [...prev, newDocument]);
      
      // Sauvegarder dans IndexedDB
      await saveDocument(newDocument);
        
      // Reset floating button
      setShowOptions(false);
      setProcessingStatus('');
    } catch (error) {
      console.error('Document processing error:', error);
      setProcessingStatus('Erreur lors du traitement du document');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Pas besoin de nettoyer les états car useEffect le fera
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonctions pour la caméra
  const startCamera = async () => {
    try {
      // Fermer d'abord toute session de caméra existante
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      // Accéder à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, // caméra arrière par défaut
        audio: false 
      });
      
      // Stocker le stream et activer l'affichage de la caméra
      setCameraStream(stream);
      setShowCamera(true);
      setShowOptions(false); // Fermer le menu flottant
      
      // Une fois l'état mis à jour et le composant rendu
      // connecter le stream à l'élément vidéo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    }
  };

  // Fonction pour capturer l'image
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Définir les dimensions du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image sur le canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir le canvas en blob
    canvas.toBlob(async (blob) => {
      // Créer un fichier à partir du blob
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Traiter l'image comme si elle venait d'un input file
      const event = { target: { files: [file] } };
      await handleDocumentCapture(event);
      
      // Fermer la caméra
      closeCamera();
    }, 'image/jpeg', 0.95); // qualité 95%
  };

  // Fonction pour fermer la caméra
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Fonction pour visualiser un document
  const viewDocument = (doc) => {
    setViewingDocument(doc);
  };

  // Fonction pour fermer la visionneuse
  const closeViewer = () => {
    setViewingDocument(null);
  };

  // Fonction pour télécharger un document
  const downloadDocument = (doc) => {
    if (!doc.fileBlob) {
      alert("Le fichier n'est plus disponible pour téléchargement.");
      return;
    }
    
    try {
      // Créer un lien temporaire
      const link = document.createElement('a');
      link.href = doc.fileBlob;
      link.download = doc.name || "document"; // Utiliser un nom par défaut si nécessaire
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement du fichier.");
    }
  };

  // Fonction pour partager un document
  const shareDocument = async (doc) => {
    if (!doc.fileBlob) {
      alert("Le fichier n'est plus disponible pour partage.");
      return;
    }

    if (navigator.share) {
      try {
        // Récupérer le fichier depuis l'URL
        const response = await fetch(doc.fileBlob);
        const blob = await response.blob();
        const file = new File([blob], doc.name || "document", { type: doc.fileType || "application/octet-stream" });
        
        await navigator.share({
          title: doc.name || "Document",
          text: `Document: ${doc.name || "Sans nom"}`,
          files: [file]
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Le partage a échoué. Essayez de télécharger le document et de le partager manuellement.');
      }
    } else {
      alert('Votre navigateur ne prend pas en charge la fonction de partage. Essayez de télécharger le document et de le partager manuellement.');
    }
  };

  // Fonction de recherche intelligente améliorée
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Mettre la recherche en minuscules
    const query = searchQuery.toLowerCase();
    
    // Diviser la recherche en termes individuels pour une recherche plus précise
    const searchTerms = query.split(/\s+/).filter(term => term.length > 1);
    
    // Créer une map pour stocker les résultats avec des scores de pertinence
    const scoredResults = new Map();
    
    // Recherche dans tous les documents
    documents.forEach(doc => {
      let score = 0;
      
      // Vérifier chaque terme de recherche
      searchTerms.forEach(term => {
        // Recherche dans le nom du document (priorité élevée)
        if (doc.name.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Recherche dans le type de document (priorité élevée)
        if (doc.type && doc.type.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Recherche dans la catégorie (priorité moyenne)
        if (doc.category && doc.category.toLowerCase().includes(term)) {
          score += 5;
        }
        
        // Recherche dans les mots-clés extraits (priorité élevée)
        if (doc.keywords && doc.keywords.some(keyword => keyword.includes(term))) {
          score += 8;
        }
        
        // Recherche dans le texte extrait (priorité normale)
        if (doc.extractedText) {
          // Bonus si le terme apparaît plusieurs fois dans le texte
          const regex = new RegExp(term, 'gi');
          const matches = doc.extractedText.match(regex);
          if (matches) {
            score += Math.min(matches.length, 5); // Maximum 5 points pour éviter qu'un seul critère domine
          }
        }
        
        // Bonus pour les correspondances exactes de termes importants
        // Par exemple pour trouver rapidement des factures spécifiques
        const importantTerms = ["facture", "contrat", "attestation", "reçu", "bulletin", "impôt"];
        if (importantTerms.includes(term) && doc.extractedText && doc.extractedText.toLowerCase().includes(term)) {
          score += 3;
        }
      });
      
      // Si le document a un score positif, l'ajouter aux résultats
      if (score > 0) {
        scoredResults.set(doc, score);
      }
    });
    
    // Convertir la Map en tableau et trier par score décroissant
    const sortedResults = Array.from(scoredResults.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Mettre à jour l'état pour afficher les résultats
    if (sortedResults.length > 0) {
      setSelectedCategory('search-results');
      
      // Stocker les résultats de recherche pour filtrer l'affichage
      setSearchResults(sortedResults);
      
      // Afficher un message de succès
      setProcessingStatus(`${sortedResults.length} document(s) trouvé(s)`);
      setTimeout(() => setProcessingStatus(''), 3000);
    } else {
      // Aucun résultat
      setSelectedCategory('search-results');
      setSearchResults([]);
      setProcessingStatus('Aucun document ne correspond à votre recherche');
      setTimeout(() => setProcessingStatus(''), 3000);
    }
  };

  // Ajoutez cette fonction pour réinitialiser la recherche
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory(null);
  };

  // Fonction pour formater la date
  const formatDate = (isoDate) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return 'Date inconnue';
    }
  };

  // Fonction pour supprimer un document
  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    // Supprimer de la base de données
    deleteDocumentFromDB(docId);
    // Si on est en train de visualiser ce document, fermer la visionneuse
    if (viewingDocument && viewingDocument.id === docId) {
      closeViewer();
    }
  };

  // Fonction pour vérifier si un document est une image
  const isImageDocument = (doc) => {
    return doc && doc.fileType && doc.fileType.includes('image');
  };

  // Fonction pour vérifier si un document est un PDF
  const isPdfDocument = (doc) => {
    return doc && doc.fileType && doc.fileType === 'application/pdf';
  };

  return (
    <div className="document-management-container">
      {/* Header */}
      <header className="app-header">
        <h1>Gestionnaire de Documents Intelligents</h1>
        
        {/* User Authentication Status */}
        <div className="user-auth-status">
          {currentUser ? (
            <div className="user-info">
              <span>{currentUser.email}</span>
            </div>
          ) : (
            <div className="login-message">
              <p>Connectez-vous pour sauvegarder vos documents</p>
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Recherche intelligente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-button">
            <Search size={20} />
          </button>
        </div>
      </header>

      {currentUser ? (
        <>
          {/* Categories Grid */}
          <div className="categories-grid">
            <div 
              className={`category-card ${selectedCategory === 'search-results' ? 'selected search-results-category' : selectedCategory === null ? 'selected' : ''}`}
              onClick={() => {
                if (selectedCategory === 'search-results') {
                  clearSearch();
                } else {
                  setSelectedCategory(null);
                }
              }}
            >
              <span>{selectedCategory === 'search-results' ? 'Résultats de recherche' : 'Tous les documents'}</span>
              <span className="document-count">
                {selectedCategory === 'search-results' ? searchResults.length : documents.length}
              </span>
            </div>
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
                <span className="document-count">
                  {documents.filter(doc => doc.category === category).length}
                </span>
              </div>
            ))}
          </div>

          {/* Document Viewer Modal */}
          {viewingDocument && (
            <div className="document-viewer-modal" onClick={closeViewer}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{viewingDocument.name}</h2>
                  <button onClick={closeViewer} className="close-button" style={{ fontSize: '24px', fontWeight: 'bold', padding: '5px 10px' }}>×</button>
                </div>
                
                <div className="document-preview">
                  {isImageDocument(viewingDocument) ? (
                    <img 
                      src={viewingDocument.fileBlob} 
                      alt={viewingDocument.name} 
                      className="document-image" 
                      style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                    />
                  ) : isPdfDocument(viewingDocument) ? (
                    <iframe 
                      src={viewingDocument.fileBlob} 
                      title={viewingDocument.name} 
                      className="document-pdf" 
                      style={{ width: '100%', height: '70vh' }}
                    />
                  ) : (
                    <div className="unsupported-format">
                      <p>Aperçu non disponible pour ce format</p>
                    </div>
                  )}
                </div>
                
                <div className="document-info">
                  <p><strong>Type:</strong> {viewingDocument.type || "Non spécifié"}</p>
                  <p><strong>Catégorie:</strong> {viewingDocument.category || "Non classé"}</p>
                  <p><strong>Ajouté le:</strong> {formatDate(viewingDocument.dateAdded)}</p>
                  
                  <div className="extracted-text">
                    <h3>Texte extrait:</h3>
                    <div className="text-content">
                      {viewingDocument.extractedText || "Aucun texte extrait"}
                    </div>
                  </div>
                  
                  <div className="keywords">
                    <h3>Mots-clés:</h3>
                    <div>
                      {viewingDocument.keywords && viewingDocument.keywords.length > 0 ? 
                        viewingDocument.keywords.map(keyword => (
                          <span key={keyword} className="keyword-tag">{keyword}</span>
                        )) : 
                        <span>Aucun mot-clé</span>
                      }
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    onClick={() => downloadDocument(viewingDocument)} 
                    className="action-button download"
                    disabled={!viewingDocument.fileBlob}
                  >
                    <Download size={16} /> Télécharger
                  </button>
                  <button 
                    onClick={() => shareDocument(viewingDocument)} 
                    className="action-button share"
                    disabled={!viewingDocument.fileBlob}
                  >
                    <Share2 size={16} /> Partager
                  </button>
                  <button 
                    onClick={() => deleteDocument(viewingDocument.id)} 
                    className="action-button delete"
                  >
                    <Trash size={16} /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de caméra */}
          {showCamera && (
            <div className="camera-modal">
              <div className="camera-container">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '80vh' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="camera-controls">
                  <button onClick={capturePhoto} className="capture-button">
                    <span className="capture-icon"></span>
                  </button>
                  <button onClick={closeCamera} className="close-camera-button">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document List with processing status */}
          <div className="documents-section">
            {isProcessing && (
              <div className="processing-indicator">
                <p>{processingStatus}</p>
                <div className="progress-bar"></div>
              </div>
            )}
            
            {processingStatus && !isProcessing && (
              <div className="processing-status">
                <p>{processingStatus}</p>
              </div>
            )}
            
            {selectedCategory === 'search-results' && (
              <div className="search-results-indicator">
                <p>
                  <strong>{searchResults.length}</strong> document(s) trouvé(s) pour "{searchQuery}"
                </p>
                <button onClick={clearSearch}>Effacer la recherche</button>
              </div>
            )}
            
            <div className="documents-list">
              {(selectedCategory === 'search-results' ? searchResults : documents
                .filter(doc => !selectedCategory || doc.category === selectedCategory))
                .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                .map(doc => (
                  <div key={doc.id} className="document-item" onClick={() => viewDocument(doc)}>
                    {isImageDocument(doc) ? (
                      <div className="document-thumbnail">
                        <img src={doc.fileBlob} alt={doc.name} />
                      </div>
                    ) : (
                      <FileText size={30} />
                    )}
                    <div className="document-details">
                      <h3>{doc.name}</h3>
                      <p>Type: {doc.type || "Non spécifié"}</p>
                      <p>Catégorie: {doc.category || "Non classé"}</p>
                      <p>Ajouté le: {formatDate(doc.dateAdded)}</p>
                    </div>
                    <div className="document-actions">
                      <button onClick={(e) => {e.stopPropagation(); viewDocument(doc);}} className="action-icon">
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => {e.stopPropagation(); downloadDocument(doc);}} 
                        className="action-icon"
                        disabled={!doc.fileBlob}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={(e) => {e.stopPropagation(); shareDocument(doc);}} 
                        className="action-icon"
                        disabled={!doc.fileBlob}
                      >
                        <Share2 size={18} />
                      </button>
                      <button onClick={(e) => {e.stopPropagation(); deleteDocument(doc.id);}} className="action-icon">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
              {/* Message quand aucun document n'est trouvé */}
              {(selectedCategory === 'search-results' ? searchResults.length === 0 : 
                documents.filter(doc => !selectedCategory || doc.category === selectedCategory).length === 0) && (
                <div className="empty-state">
                  <p>{selectedCategory === 'search-results' ? 
                    "Aucun résultat trouvé pour cette recherche" : 
                    "Aucun document dans cette catégorie"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="floating-action-button">
            <button 
              className="main-fab" 
              onClick={() => setShowOptions(!showOptions)}
              disabled={isProcessing}
            >
              {showOptions ? '×' : '+'}
            </button>
            
            {showOptions && (
  <div className="fab-options">
    <button 
      onClick={startCamera}
      className="fab-option"
      disabled={isProcessing}
    >
      <Camera size={24} /> Prendre une photo
    </button>
  </div>
)}
          </div>
        </>
      ) : (
        <div className="auth-required-message">
          <h2>Authentification requise</h2>
          <p>Veuillez vous connecter pour accéder à vos documents et en ajouter de nouveaux.</p>
          <p>Les documents capturés sont sauvegardés uniquement pour les utilisateurs authentifiés.</p>
          {/* Ici vous pourriez ajouter un bouton qui redirige vers la page de connexion */}
        </div>
      )}
    </div>
  );
};

export default DocumentManagementApp;
