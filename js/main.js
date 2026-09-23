/* ═══════════════════════════════════════════════
   SefArte — JavaScript principal
   Carga series y obras desde Firestore
   Agrupa obras por serie con filtros dinámicos
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
let currentIndex   = 0;
let currentVisible = [];

function openLightbox(index) {
  currentVisible = [...document.querySelectorAll('#galeria-grid .obra:not(.hidden)')];
  if (!currentVisible[index]) return;
  currentIndex = index;
  const img    = currentVisible[index].querySelector('img');
  const titulo = currentVisible[index].querySelector('.obra__titulo')?.textContent || '';
  const tipo   = currentVisible[index].querySelector('.obra__tipo')?.textContent   || '';
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
  currentVisible = [...document.querySelectorAll('#galeria-grid .obra:not(.hidden)')];
  currentIndex = (currentIndex + dir + currentVisible.length) % currentVisible.length;
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

// ─── Filtros por serie ───
function renderFiltros(series) {
  const cont = document.getElementById('filtros');
  cont.innerHTML = '';

  // Botón "Todas"
  const btnTodas = document.createElement('button');
  btnTodas.className = 'filtro active';
  btnTodas.dataset.filter = 'all';
  btnTodas.textContent = 'Todas';
  cont.appendChild(btnTodas);

  // Un botón por serie
  series.forEach(serie => {
    const btn = document.createElement('button');
    btn.className = 'filtro';
    btn.dataset.filter = serie.id;
    btn.textContent = serie.nombre;
    cont.appendChild(btn);
  });

  // Eventos de filtro
  cont.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      cont.querySelectorAll('.filtro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      // Mostrar/ocultar obras
      document.querySelectorAll('#galeria-grid .obra').forEach(obra => {
        const match = filter === 'all' || obra.dataset.serie === filter;
        obra.classList.toggle('hidden', !match);
      });

      // Mostrar/ocultar encabezados de serie
      document.querySelectorAll('#galeria-grid .serie-header').forEach(header => {
        if (filter === 'all') {
          header.classList.remove('hidden');
        } else {
          header.classList.toggle('hidden', header.dataset.serie !== filter);
        }
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
  }, { threshold: 0.1 });

  document.querySelectorAll('#galeria-grid .obra, #galeria-grid .serie-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ─── Crear elemento de obra ───
function createObraEl(obra, globalIndex) {
  const el = document.createElement('div');
  el.className    = 'obra';
  el.dataset.tipo  = obra.categoria || 'cuadro';
  el.dataset.serie = obra.serieId   || '';
  el.dataset.id    = obra.id        || '';
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

  el.querySelector('.obra__ver').addEventListener('click', () => openLightbox(globalIndex));
  el.querySelector('.obra__img-wrap').addEventListener('click', (e) => {
    if (!e.target.closest('.obra__ver')) openLightbox(globalIndex);
  });
  el.querySelector('.obra__img-wrap').style.cursor = 'pointer';
  return el;
}

// ─── Render principal: series + obras agrupadas ───
function renderGrid(obras, series) {
  const grid = document.getElementById('galeria-grid');
  grid.innerHTML = '';

  if (obras.length === 0) {
    grid.innerHTML = '<p class="galeria__empty">No hay obras todavía.</p>';
    return;
  }

  // Agrupar obras por serie
  const sinSerie = obras.filter(o => !o.serieId);
  const porSerie = {};
  series.forEach(s => { porSerie[s.id] = []; });
  obras.forEach(o => {
    if (o.serieId && porSerie[o.serieId]) porSerie[o.serieId].push(o);
  });

  let globalIndex = 0;

  // Renderizar cada serie con su encabezado
  series.forEach(serie => {
    const obrasDeEstaSerie = porSerie[serie.id] || [];
    if (obrasDeEstaSerie.length === 0) return;

    // Encabezado de serie
    const header = document.createElement('div');
    header.className = 'serie-header';
    header.dataset.serie = serie.id;
    header.innerHTML = `
      <h3 class="serie-header__titulo">${serie.nombre}</h3>
      ${serie.descripcion ? `<p class="serie-header__desc">${serie.descripcion}</p>` : ''}
      <div class="serie-header__linea"></div>`;
    grid.appendChild(header);

    // Obras de esta serie
    obrasDeEstaSerie.forEach(obra => {
      grid.appendChild(createObraEl(obra, globalIndex));
      globalIndex++;
    });
  });

  // Obras sin serie asignada (al final)
  if (sinSerie.length > 0) {
    const header = document.createElement('div');
    header.className = 'serie-header';
    header.dataset.serie = '__sin_serie';
    header.innerHTML = `
      <h3 class="serie-header__titulo">Otras obras</h3>
      <div class="serie-header__linea"></div>`;
    grid.appendChild(header);
    sinSerie.forEach(obra => {
      grid.appendChild(createObraEl(obra, globalIndex));
      globalIndex++;
    });
  }

  animateObras();
}

// ─── Sobre mí ───
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

// ─── Animaciones sobre-mi / contacto ───
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

// ─── Exportar para admin.js y firebase-init.js ───
window._sefarte = { renderGrid, renderFiltros, applySobreData };
