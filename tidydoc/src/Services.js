import React, { useState, useRef } from 'react';
import { Camera, FileText, Search, Shield, FolderPlus } from 'lucide-react';
import './Services.css'

// Mock AI Service (would be replaced with actual backend integration)
const AIDocumentService = {
  // Simulated OCR and document classification
  processDocument: async (file) => {
    // In a real implementation, this would call a backend OCR/AI service
    return {
      extractedText: 'Simulated extracted text from document',
      documentType: 'Invoice',
      keywords: ['payment', 'purchase', 'date'],
      suggestedCategory: 'Factures & Reçus'
    };
  },

  searchDocuments: async (query) => {
    // Simulated intelligent search
    const mockDocuments = [
      { 
        id: '1', 
        name: 'Facture Electricité', 
        category: 'Factures & Reçus',
        preview: 'Extrait de facture EDF...'
      }
    ];
    return mockDocuments.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) || 
      doc.preview.toLowerCase().includes(query.toLowerCase())
    );
  }
};

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const fileInputRef = useRef(null);

  // Document capture and processing
  const handleDocumentCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Process document with AI service
        const processedDoc = await AIDocumentService.processDocument(file);
        
        // Create document object
        const newDocument = {
          id: Date.now().toString(),
          name: file.name,
          file: file,
          type: processedDoc.documentType,
          category: processedDoc.suggestedCategory,
          extractedText: processedDoc.extractedText,
          keywords: processedDoc.keywords
        };

        // Update documents state
        setDocuments(prev => [...prev, newDocument]);
        
        // Reset floating button
        setShowOptions(false);
      } catch (error) {
        console.error('Document processing error:', error);
      }
    }
  };

  // Intelligent search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await AIDocumentService.searchDocuments(searchQuery);
      // In a full implementation, you'd update the view with search results
      console.log('Search Results:', results);
    }
  };

  return (
    <div className="document-management-container">
      {/* Header */}
      <header className="app-header">
        <h1>Gestionnaire de Documents Intelligents</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Recherche intelligente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="categories-grid">
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

      {/* Document List */}
      <div className="documents-list">
        {documents
          .filter(doc => !selectedCategory || doc.category === selectedCategory)
          .map(doc => (
            <div key={doc.id} className="document-item">
              <FileText size={30} />
              <div className="document-details">
                <h3>{doc.name}</h3>
                <p>Type: {doc.type}</p>
                <p>Catégorie: {doc.category}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Floating Action Button */}
      <div className="floating-action-button">
        <button 
          className="main-fab" 
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? '×' : '+'}
        </button>
        
        {showOptions && (
          <div className="fab-options">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="fab-option"
            >
              <Camera size={24} /> Capture
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,application/pdf"
              onChange={handleDocumentCapture}
            />
            <button className="fab-option">
              <FolderPlus size={24} /> Télécharger
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagementApp;