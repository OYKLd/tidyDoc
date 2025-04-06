import * as tf from '@tensorflow/tfjs';
import { encodeText, categories } from './trainModel';

// Charger le modèle entraîné
const loadModel = async () => {
  try {
    return await tf.loadLayersModel('localstorage://document-classifier');
  } catch (error) {
    console.error("Erreur de chargement du modèle:", error);
    return null;
  }
};

const classifyDocument = async (text) => {
  const model = await loadModel();
  if (!model) return "Non Classé";

  const inputTensor = tf.tensor2d([encodeText(text)]);
  const prediction = model.predict(inputTensor);
  const categoryIndex = prediction.argMax(1).dataSync()[0];

  return categories[categoryIndex] || "Non Classé";
};

export { classifyDocument };
