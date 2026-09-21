/* ═══════════════════════════════════════════════
   SefArte — Configuración Firebase + Cloudinary
   ═══════════════════════════════════════════════ */

// Firebase
const firebaseConfig = {
  apiKey:            "AIzaSyBsJ8DZTf8z1I6FSgY1N7hmwvoCaEUlqpk",
  authDomain:        "sefarte-45e63.firebaseapp.com",
  projectId:         "sefarte-45e63",
  storageBucket:     "sefarte-45e63.firebasestorage.app",
  messagingSenderId: "984153251298",
  appId:             "1:984153251298:web:22d595e938c813906f2dbb",
  measurementId:     "G-BS2SCZW8WX"
};

// Cloudinary (solo upload no firmado — API secret NUNCA va en el frontend)
const cloudinaryConfig = {
  cloudName:   'ouont68q',
  uploadPreset: 'sefarte_unsigned'   // lo creamos en el siguiente paso
};
