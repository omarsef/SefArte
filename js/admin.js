/* ═══════════════════════════════════════════════
   SefArte — Panel de administración
   Firebase Firestore + Cloudinary
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Firebase refs (inicializados desde firebase-init.js) ── */
let db, auth;
let obrasListener = null;

/* ══════════════════════════════════════════════
   INYECTAR HTML DEL PANEL
══════════════════════════════════════════════ */
document.body.insertAdjacentHTML('beforeend', `
<button id="admin-fab" title="Administrar" aria-label="Administrar">⚙</button>

<div id="admin-login-overlay" class="adm-overlay" aria-hidden="true">
  <div class="adm-modal adm-modal--sm">
    <h2 class="adm-modal__title">Acceso administrador</h2>
    <input id="admin-email"    class="adm-input" type="email"    placeholder="Email" autocomplete="username" />
    <input id="admin-password" class="adm-input" type="password" placeholder="Contraseña" autocomplete="current-password" />
    <p id="admin-login-err" class="adm-err"></p>
    <div class="adm-row adm-row--end">
      <button class="adm-btn adm-btn--ghost"   id="admin-login-cancel">Cancelar</button>
      <button class="adm-btn adm-btn--primary"  id="admin-login-ok">Entrar</button>
    </div>
  </div>
</div>

<div id="admin-panel-overlay" class="adm-overlay" aria-hidden="true">
  <div class="adm-panel">
    <div class="adm-panel__header">
      <span class="adm-panel__title">✦ Panel de edición</span>
      <div class="adm-panel__header-right">
        <button class="adm-btn adm-btn--ghost adm-btn--sm" id="admin-logout">Salir</button>
        <button class="adm-close" id="admin-panel-close">✕</button>
      </div>
    </div>
    <div class="adm-tabs">
      <button class="adm-tab active" data-tab="obras">Obras</button>
      <button class="adm-tab" data-tab="sobre">Sobre mí</button>
    </div>

    <div class="adm-tabcontent" id="tab-obras">
      <button class="adm-btn adm-btn--primary adm-mb" id="admin-add-obra">+ Agregar obra</button>
      <div id="admin-obras-list" class="adm-obras-list"></div>
    </div>

    <div class="adm-tabcontent adm-hidden" id="tab-sobre">
      <div class="adm-field">
        <label class="adm-label">Foto del artista</label>
        <div class="adm-img-preview" id="sobre-img-preview"><span>Sin foto</span></div>
        <label class="adm-btn adm-btn--ghost adm-upload-btn">
          Cambiar foto
          <input type="file" accept="image/*" id="sobre-img-input" class="adm-file-hidden" />
        </label>
      </div>
      <div class="adm-field">
        <label class="adm-label" for="sobre-p1">Párrafo 1</label>
        <textarea class="adm-input adm-textarea" id="sobre-p1"></textarea>
      </div>
      <div class="adm-field">
        <label class="adm-label" for="sobre-p2">Párrafo 2</label>
        <textarea class="adm-input adm-textarea" id="sobre-p2"></textarea>
      </div>
      <p class="adm-err adm-hidden" id="sobre-err"></p>
      <button class="adm-btn adm-btn--primary" id="sobre-save">Guardar cambios</button>
      <p class="adm-ok adm-hidden" id="sobre-ok">¡Guardado!</p>
    </div>
  </div>
</div>

<div id="admin-obra-modal-overlay" class="adm-overlay" aria-hidden="true">
  <div class="adm-modal">
    <h2 class="adm-modal__title" id="obra-modal-title">Nueva obra</h2>
    <div class="adm-field">
      <label class="adm-label">Imagen</label>
      <div class="adm-img-preview" id="obra-img-preview"><span>Sin imagen</span></div>
      <label class="adm-btn adm-btn--ghost adm-upload-btn">
        Elegir imagen
        <input type="file" accept="image/*" id="obra-img-input" class="adm-file-hidden" />
      </label>
    </div>
    <div class="adm-field">
      <label class="adm-label" for="obra-titulo">Título</label>
      <input class="adm-input" id="obra-titulo" type="text" placeholder="Ej: Sin título I" />
    </div>
    <div class="adm-field">
      <label class="adm-label" for="obra-tecnica">Técnica</label>
      <input class="adm-input" id="obra-tecnica" type="text" placeholder="Ej: Óleo sobre lienzo" />
    </div>
    <div class="adm-field">
      <label class="adm-label" for="obra-categoria">Categoría</label>
      <select class="adm-input" id="obra-categoria">
        <option value="cuadro">Cuadro</option>
        <option value="foto">Fotografía</option>
      </select>
    </div>
    <p class="adm-err adm-hidden" id="obra-modal-err"></p>
    <div class="adm-row adm-row--end">
      <button class="adm-btn adm-btn--ghost"   id="obra-modal-cancel">Cancelar</button>
      <button class="adm-btn adm-btn--primary"  id="obra-modal-save">Guardar</button>
    </div>
  </div>
</div>
`);

/* ── Referencias DOM ── */
const fab              = document.getElementById('admin-fab');
const loginOverlay     = document.getElementById('admin-login-overlay');
const emailInput       = document.getElementById('admin-email');
const passwordInput    = document.getElementById('admin-password');
const loginErr         = document.getElementById('admin-login-err');
const loginCancel      = document.getElementById('admin-login-cancel');
const loginOk          = document.getElementById('admin-login-ok');
const panelOverlay     = document.getElementById('admin-panel-overlay');
const panelClose       = document.getElementById('admin-panel-close');
const logoutBtn        = document.getElementById('admin-logout');
const tabs             = document.querySelectorAll('.adm-tab');
const tabContents      = document.querySelectorAll('.adm-tabcontent');
const addObraBtn       = document.getElementById('admin-add-obra');
const obrasList        = document.getElementById('admin-obras-list');
const obraModalOverlay = document.getElementById('admin-obra-modal-overlay');
const obraModalTitle   = document.getElementById('obra-modal-title');
const obraImgInput     = document.getElementById('obra-img-input');
const obraImgPreview   = document.getElementById('obra-img-preview');
const obraTituloInput  = document.getElementById('obra-titulo');
const obraTecnica      = document.getElementById('obra-tecnica');
const obraCategoria    = document.getElementById('obra-categoria');
const obraModalCancel  = document.getElementById('obra-modal-cancel');
const obraModalSave    = document.getElementById('obra-modal-save');
const obraModalErr     = document.getElementById('obra-modal-err');
const sobreImgInput    = document.getElementById('sobre-img-input');
const sobreImgPreview  = document.getElementById('sobre-img-preview');
const sobreP1          = document.getElementById('sobre-p1');
const sobreP2          = document.getElementById('sobre-p2');
const sobreSave        = document.getElementById('sobre-save');
const sobreOk          = document.getElementById('sobre-ok');
const sobreErr         = document.getElementById('sobre-err');

let editingDocId  = null;
let pendingImgB64 = null;
let sobreImgB64   = null;

/* ── Helpers ── */
function setPreview(el, src) {
  if (src) { el.style.backgroundImage = `url('${src}')`; el.innerHTML = ''; }
  else      { el.style.backgroundImage = ''; el.innerHTML = '<span>Sin imagen</span>'; }
}
function showErr(el, msg) { el.textContent = msg; el.classList.remove('adm-hidden'); }
function hideErr(el)      { el.textContent = ''; el.classList.add('adm-hidden'); }
function readB64(file)    {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = () => rej(new Error('No se pudo leer el archivo'));
    r.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════════════
   CLOUDINARY — upload sin firmar
══════════════════════════════════════════════ */
async function uploadToCloudinary(base64DataUrl) {
  const { cloudName, uploadPreset } = cloudinaryConfig;
  const formData = new FormData();
  formData.append('file',          base64DataUrl);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder',        'sefarte');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body:   formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error ${res.status} al subir imagen`);
  }
  const data = await res.json();
  return data.secure_url;
}

/* ══════════════════════════════════════════════
   INICIALIZACIÓN FIREBASE
══════════════════════════════════════════════ */
function initAdmin(firebaseDb, firebaseAuth) {
  db   = firebaseDb;
  auth = firebaseAuth;

  // Escuchar cambios de sesión
  auth.onAuthStateChanged(user => {
    if (user) {
      openPanel();
    }
  });

  // Cargar obras en tiempo real
  loadObrasRealtime();

  // Cargar datos "Sobre mí"
  loadSobreData();
}

/* ══════════════════════════════════════════════
   OBRAS — lectura en tiempo real desde Firestore
══════════════════════════════════════════════ */
function loadObrasRealtime() {
  if (obrasListener) obrasListener(); // cancelar listener anterior
  obrasListener = db.collection('obras')
    .orderBy('orden', 'asc')
    .onSnapshot(snapshot => {
      const obras = [];
      snapshot.forEach(doc => obras.push({ id: doc.id, ...doc.data() }));
      window._sefarte.renderGrid(obras);
    }, err => {
      console.error('Error cargando obras:', err);
    });
}

/* ══════════════════════════════════════════════
   SOBRE MÍ — lectura
══════════════════════════════════════════════ */
function loadSobreData() {
  db.collection('config').doc('sobre').get().then(doc => {
    if (doc.exists) window._sefarte.applySobreData(doc.data());
  }).catch(() => {});
}

/* ══════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════ */
fab.addEventListener('click', () => {
  loginOverlay.classList.add('adm-overlay--visible');
  loginOverlay.setAttribute('aria-hidden', 'false');
  emailInput.value = ''; passwordInput.value = '';
  loginErr.textContent = '';
  emailInput.focus();
});

loginCancel.addEventListener('click', closeLogin);
loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) closeLogin(); });
loginOk.addEventListener('click', doLogin);
passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function closeLogin() {
  loginOverlay.classList.remove('adm-overlay--visible');
  loginOverlay.setAttribute('aria-hidden', 'true');
}

async function doLogin() {
  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) { loginErr.textContent = 'Completá email y contraseña'; return; }
  loginOk.disabled = true; loginOk.textContent = 'Entrando…';
  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeLogin();
    openPanel();
  } catch (err) {
    loginErr.textContent = 'Email o contraseña incorrectos';
    loginOk.disabled = false; loginOk.textContent = 'Entrar';
  }
}

logoutBtn.addEventListener('click', () => {
  auth.signOut();
  closePanel();
});

/* ══════════════════════════════════════════════
   PANEL
══════════════════════════════════════════════ */
function openPanel() {
  renderAdminObrasList();
  loadSobreForm();
  panelOverlay.classList.add('adm-overlay--visible');
  panelOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  panelOverlay.classList.remove('adm-overlay--visible');
  panelOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

panelClose.addEventListener('click', closePanel);
panelOverlay.addEventListener('click', e => { if (e.target === panelOverlay) closePanel(); });

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('adm-hidden'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('adm-hidden');
  });
});

/* ══════════════════════════════════════════════
   LISTA DE OBRAS EN EL PANEL
══════════════════════════════════════════════ */
function renderAdminObrasList() {
  db.collection('obras').orderBy('orden', 'asc').get().then(snapshot => {
    obrasList.innerHTML = '';
    if (snapshot.empty) {
      obrasList.innerHTML = '<p class="adm-empty">No hay obras. Agregá la primera.</p>';
      return;
    }
    snapshot.forEach(doc => {
      const obra = { id: doc.id, ...doc.data() };
      const item = document.createElement('div');
      item.className = 'adm-obra-item';
      item.innerHTML = `
        <div class="adm-obra-thumb" style="${obra.imagenUrl ? `background-image:url('${obra.imagenUrl}')` : ''}">
          ${obra.imagenUrl ? '' : '<span>🖼</span>'}
        </div>
        <div class="adm-obra-info">
          <strong>${obra.titulo || '(sin título)'}</strong>
          <span>${obra.tecnica || ''}</span>
          <em>${obra.categoria === 'foto' ? 'Fotografía' : 'Cuadro'}</em>
        </div>
        <div class="adm-obra-actions">
          <button class="adm-btn adm-btn--sm adm-btn--ghost"  data-edit="${doc.id}">Editar</button>
          <button class="adm-btn adm-btn--sm adm-btn--danger" data-delete="${doc.id}">Eliminar</button>
        </div>`;
      obrasList.appendChild(item);
    });

    obrasList.querySelectorAll('[data-edit]').forEach(btn =>
      btn.addEventListener('click', () => openObraModal(btn.dataset.edit)));
    obrasList.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => deleteObra(btn.dataset.delete)));
  });
}

async function deleteObra(docId) {
  if (!confirm('¿Eliminar esta obra?')) return;
  await db.collection('obras').doc(docId).delete();
  renderAdminObrasList();
}

/* ══════════════════════════════════════════════
   MODAL OBRA
══════════════════════════════════════════════ */
addObraBtn.addEventListener('click', () => openObraModal(null));

async function openObraModal(docId) {
  editingDocId  = docId;
  pendingImgB64 = null;
  setPreview(obraImgPreview, null);
  obraTituloInput.value = '';
  obraTecnica.value     = '';
  obraCategoria.value   = 'cuadro';
  hideErr(obraModalErr);
  obraModalSave.disabled    = false;
  obraModalSave.textContent = 'Guardar';

  if (docId) {
    obraModalTitle.textContent = 'Editar obra';
    const doc = await db.collection('obras').doc(docId).get();
    if (doc.exists) {
      const d = doc.data();
      obraTituloInput.value = d.titulo   || '';
      obraTecnica.value     = d.tecnica  || '';
      obraCategoria.value   = d.categoria || 'cuadro';
      if (d.imagenUrl) { pendingImgB64 = d.imagenUrl; setPreview(obraImgPreview, d.imagenUrl); }
    }
  } else {
    obraModalTitle.textContent = 'Nueva obra';
  }

  obraModalOverlay.classList.add('adm-overlay--visible');
  obraModalOverlay.setAttribute('aria-hidden', 'false');
}

function closeObraModal() {
  obraModalOverlay.classList.remove('adm-overlay--visible');
  obraModalOverlay.setAttribute('aria-hidden', 'true');
  obraImgInput.value = '';
  pendingImgB64 = null;
}

obraModalCancel.addEventListener('click', closeObraModal);
obraModalOverlay.addEventListener('click', e => { if (e.target === obraModalOverlay) closeObraModal(); });

obraImgInput.addEventListener('change', () => {
  const file = obraImgInput.files[0];
  if (!file) return;
  readB64(file).then(b64 => {
    pendingImgB64 = b64;
    setPreview(obraImgPreview, b64);
    hideErr(obraModalErr);
  }).catch(() => showErr(obraModalErr, 'No se pudo leer la imagen'));
});

obraModalSave.addEventListener('click', async () => {
  const titulo    = obraTituloInput.value.trim();
  const tecnica   = obraTecnica.value.trim();
  const categoria = obraCategoria.value;

  if (!titulo) { showErr(obraModalErr, 'El título es obligatorio.'); return; }

  hideErr(obraModalErr);
  obraModalSave.disabled    = true;
  obraModalSave.textContent = 'Guardando…';

  try {
    let imagenUrl = (editingDocId && pendingImgB64 && pendingImgB64.startsWith('http'))
      ? pendingImgB64   // URL existente de Cloudinary, no cambió
      : null;

    // Si hay una imagen nueva (base64), subirla a Cloudinary
    if (pendingImgB64 && !pendingImgB64.startsWith('http')) {
      obraModalSave.textContent = 'Subiendo imagen…';
      imagenUrl = await uploadToCloudinary(pendingImgB64);
    }

    // Obtener el máximo orden actual para poner la nueva obra al final
    let orden = 0;
    if (!editingDocId) {
      const snap = await db.collection('obras').orderBy('orden', 'desc').limit(1).get();
      if (!snap.empty) orden = (snap.docs[0].data().orden || 0) + 1;
    }

    const obraData = { titulo, tecnica, categoria, orden };
    if (imagenUrl) obraData.imagenUrl = imagenUrl;

    if (editingDocId) {
      await db.collection('obras').doc(editingDocId).update(obraData);
    } else {
      await db.collection('obras').add(obraData);
    }

    renderAdminObrasList();
    closeObraModal();
  } catch (err) {
    obraModalSave.disabled    = false;
    obraModalSave.textContent = 'Guardar';
    showErr(obraModalErr, `Error: ${err.message}`);
  }
});

/* ══════════════════════════════════════════════
   SOBRE MÍ
══════════════════════════════════════════════ */
function loadSobreForm() {
  db.collection('config').doc('sobre').get().then(doc => {
    if (!doc.exists) return;
    const d = doc.data();
    sobreP1.value = d.parrafo1 || '';
    sobreP2.value = d.parrafo2 || '';
    if (d.imagenUrl) setPreview(sobreImgPreview, d.imagenUrl);
  });
}

sobreImgInput.addEventListener('change', () => {
  const file = sobreImgInput.files[0];
  if (!file) return;
  readB64(file).then(b64 => {
    sobreImgB64 = b64;
    setPreview(sobreImgPreview, b64);
  });
});

sobreSave.addEventListener('click', async () => {
  sobreSave.disabled    = true;
  sobreSave.textContent = 'Guardando…';
  hideErr(sobreErr);

  try {
    let imagenUrl = null;
    if (sobreImgB64) {
      sobreSave.textContent = 'Subiendo foto…';
      imagenUrl = await uploadToCloudinary(sobreImgB64);
    }

    const data = {
      parrafo1: sobreP1.value.trim(),
      parrafo2: sobreP2.value.trim(),
    };
    if (imagenUrl) data.imagenUrl = imagenUrl;

    await db.collection('config').doc('sobre').set(data, { merge: true });
    window._sefarte.applySobreData({ ...data, imagenUrl: imagenUrl || undefined });

    sobreOk.classList.remove('adm-hidden');
    setTimeout(() => sobreOk.classList.add('adm-hidden'), 2500);
    sobreImgB64 = null;
    sobreImgInput.value = '';
  } catch (err) {
    showErr(sobreErr, `Error: ${err.message}`);
  } finally {
    sobreSave.disabled    = false;
    sobreSave.textContent = 'Guardar cambios';
  }
});

/* ── Exponer initAdmin para firebase-init.js ── */
window._adminInit = initAdmin;
