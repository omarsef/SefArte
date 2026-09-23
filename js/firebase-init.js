/* ═══════════════════════════════════════════════
   SefArte — Inicialización Firebase
   Carga series + obras y arranca el panel admin
   ═══════════════════════════════════════════════ */

'use strict';

firebase.initializeApp(firebaseConfig);

const _db   = firebase.firestore();
const _auth = firebase.auth();

// ─── Estado global de series ───
window._seriesCache = [];

// ─── Cargar series y obras en tiempo real ───
function arrancarGaleria() {
  // 1. Cargar series primero (ordenadas)
  _db.collection('series').orderBy('orden', 'asc').onSnapshot(seriesSnap => {
    const series = [];
    seriesSnap.forEach(doc => series.push({ id: doc.id, ...doc.data() }));
    window._seriesCache = series;

    // Renderizar filtros
    window._sefarte.renderFiltros(series);

    // 2. Cargar TODAS las obras (sin orderBy para no requerir índice)
    _db.collection('obras').onSnapshot(obrasSnap => {
      const obras = [];
      obrasSnap.forEach(doc => obras.push({ id: doc.id, ...doc.data() }));
      // Ordenar en el cliente por serieOrden (si existe) o por título
      obras.sort((a, b) => (a.serieOrden ?? 999) - (b.serieOrden ?? 999) || (a.titulo || '').localeCompare(b.titulo || ''));
      window._sefarte.renderGrid(obras, series);
    }, err => console.error('Error cargando obras:', err));

  }, err => console.error('Error cargando series:', err));

  // 3. Cargar datos "Sobre mí"
  _db.collection('config').doc('sobre').get()
    .then(doc => { if (doc.exists) window._sefarte.applySobreData(doc.data()); })
    .catch(() => {});
}

arrancarGaleria();

// ─── Arrancar panel admin ───
window._adminInit(_db, _auth);
