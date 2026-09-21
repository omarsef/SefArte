/* ═══════════════════════════════════════════════
   SefArte — Inicialización Firebase
   Conecta Firestore + Auth y arranca la app
   ═══════════════════════════════════════════════ */

'use strict';

// Inicializar Firebase con la config de firebase-config.js
firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

// Arrancar el panel de admin (definido en admin.js)
window._adminInit(db, auth);
