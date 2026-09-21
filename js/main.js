/* ═══════════════════════════════════════════════
   SefArte — JavaScript principal
   Carga obras desde Firestore en tiempo real
   ═══════════════════════════════════════════════ */

'use strict';

// ─── Navbar ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ─── Hamburguesa ───
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.navbar__links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── Lightbox ───
const lightbox  = document.getElementById('lightbox');
const backdrop  = document.getElementById('lb-backdrop');
const lbImg     = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose   = document.getElementById('lb-close');
const lbPrev    = document.getElementById('lb-prev');
const lbNext    = document.getElementById('lb-next');
let currentIndex = 0;

function getVisibleObras() {
  return [...document.querySelectorAll('#galeria-grid .obra:not(.hidden)')];
}

function openLightbox(index) {
  const visible = getVisibleObras();
  if (!visible[index]) return;
  currentIndex = index;
  const img    = visible[index].querySelector('img');
  const titulo = visible[index].querySelector('.obra__titulo')?.textContent || '';
  const tipo   = visible[index].querySelector('.obra__tipo')?.textContent   || '';
  lbImg.src = img?.src || '';
  lbImg.alt = titulo;
  lbCaption.textContent = tipo ? `${titulo} · ${tipo}` : titulo;
  lightbox.classList.add('active');
  backdrop.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  backdrop.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function navigateLightbox(dir) {
  const visible = getVisibleObras();
  currentIndex = (currentIndex + dir + visible.length) % visible.length;
  openLightbox(currentIndex);
}

lbClose.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => navigateLightbox(-1));
lbNext.addEventListener('click', () => navigateLightbox(1));
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ─── Filtros ───
function bindFiltros() {
  const filtros = document.querySelectorAll('.filtro');
  const obras   = document.querySelectorAll('#galeria-grid .obra');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      obras.forEach(obra => {
        obra.classList.toggle('hidden', filter !== 'all' && obra.dataset.tipo !== filter);
      });
    });
  });
}

// ─── Animación de aparición ───
function animateObras() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('#galeria-grid .obra').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ─── Render de una obra individual ───
function createObraEl(obra, index) {
  const el = document.createElement('div');
  el.className    = 'obra';
  el.dataset.tipo = obra.categoria || 'cuadro';
  el.dataset.id   = obra.id || '';
  el.innerHTML = `
    <div class="obra__img-wrap">
      <img src="${obra.imagenUrl || ''}" alt="${obra.titulo || ''}" loading="lazy"
           onerror="this.parentElement.classList.add('obra__img-wrap--placeholder')" />
      <div class="obra__overlay">
        <button class="obra__ver">Ver obra</button>
      </div>
    </div>
    <div class="obra__info">
      <h3 class="obra__titulo">${obra.titulo || 'Sin título'}</h3>
      <p class="obra__tipo">${obra.tecnica || ''}</p>
    </div>`;

  // Lightbox
  el.querySelector('.obra__ver').addEventListener('click', () => openLightbox(index));
  el.querySelector('.obra__img-wrap').addEventListener('click', (e) => {
    if (!e.target.closest('.obra__ver')) openLightbox(index);
  });
  el.querySelector('.obra__img-wrap').style.cursor = 'pointer';

  return el;
}

// ─── Render completo del grid ───
function renderGrid(obras) {
  const grid = document.getElementById('galeria-grid');
  grid.innerHTML = '';
  if (obras.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--c-muted);grid-column:1/-1;padding:2rem">No hay obras todavía.</p>';
    return;
  }
  obras.forEach((obra, i) => grid.appendChild(createObraEl(obra, i)));
  bindFiltros();
  animateObras();
}

// ─── Sobre mí desde Firestore ───
function applySobreData(data) {
  if (!data) return;
  const artImg = document.querySelector('.sobre-mi__frame img');
  const p1el   = document.querySelector('.sobre-mi__texto p:nth-of-type(1)');
  const p2el   = document.querySelector('.sobre-mi__texto p:nth-of-type(2)');
  if (artImg && data.imagenUrl) artImg.src = data.imagenUrl;
  if (p1el   && data.parrafo1)  p1el.textContent = data.parrafo1;
  if (p2el   && data.parrafo2)  p2el.textContent = data.parrafo2;
}

// ─── Formulario de contacto ───
const form     = document.getElementById('contacto-form');
const feedback = document.getElementById('form-feedback');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  feedback.textContent = 'Mensaje enviado. ¡Gracias por escribir!';
  form.reset();
  setTimeout(() => { feedback.textContent = ''; }, 5000);
});

// ─── Animación sobre-mi y contacto ───
const obs2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      obs2.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.sobre-mi__inner, .contacto__form').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  obs2.observe(el);
});

// ─── Arranque: esperar a que Firebase esté listo ───
window._sefarte = { renderGrid, applySobreData, createObraEl, bindFiltros };
