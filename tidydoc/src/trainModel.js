import * as tf from '@tensorflow/tfjs';

// Exemples de textes et catégories associées (Données d'entraînement)
const trainingData = [
  { text: "facture de téléphone du mois de mars, montant total 50 euros", category: "Factures & Reçus" },
  { text: "contrat de location signé entre propriétaire et locataire", category: "Contrats & Légaux" },
  { text: "attestation d'assurance pour mon véhicule, carte grise en pièce jointe", category: "Véhicules" },
  { text: "relevé bancaire montrant les transactions du mois", category: "Documents Financiers" },
  { text: "ordonnance du médecin avec prescription de médicaments", category: "Dossiers Médicaux" }
];

// Convertir les catégories en nombres
const categories = ["Factures & Reçus", "Contrats & Légaux", "Véhicules", "Documents Financiers", "Dossiers Médicaux"];
const categoryToIndex = Object.fromEntries(categories.map((c, i) => [c, i]));

const encodeText = (text) => {
  // Convertir le texte en un tableau de nombres (vectorisation basique)
  return Array.from(text.toLowerCase().replace(/[^\w\s]/gi, '').split(' '))
    .map(word => word.charCodeAt(0) % 100) // Convertir en nombres
    .slice(0, 20); // Limiter à 20 mots
};

const trainModel = async () => {
  const xs = tf.tensor2d(trainingData.map(d => encodeText(d.text)));
  const ys = tf.tensor2d(trainingData.map(d => tf.oneHot(categoryToIndex[d.category], categories.length).arraySync()));

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [20], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));

  model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

  console.log("Entraînement en cours...");
  await model.fit(xs, ys, { epochs: 50 });

  console.log("Modèle entraîné !");
  await model.save('localstorage://document-classifier');

  return model;
};

export { trainModel, encodeText, categories };
