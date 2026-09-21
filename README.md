# SefArte — Guía de inicio rápido

## Estructura del proyecto

```
Pagina de Cuadros/
│
├── index.html              ← Página principal
├── css/
│   └── style.css           ← Todos los estilos
├── js/
│   └── main.js             ← Interactividad (galería, lightbox, nav)
├── images/
│   ├── gallery/            ← Imágenes de las obras
│   │   ├── cuadro1.jpg
│   │   ├── cuadro2.jpg
│   │   ├── cuadro3.jpg
│   │   ├── foto1.jpg
│   │   ├── foto2.jpg
│   │   └── foto3.jpg
│   └── hero/
│       └── artista.jpg     ← Tu foto en la sección "Sobre mí"
└── README.md
```

## ¿Cómo añadir una obra?

Abre `index.html` y copia uno de los bloques `.obra` dentro de `#galeria-grid`:

```html
<div class="obra" data-tipo="cuadro">   <!-- o data-tipo="foto" -->
  <div class="obra__img-wrap">
    <img src="images/gallery/MI-IMAGEN.jpg" alt="Descripción" loading="lazy" 
         onerror="this.parentElement.classList.add('obra__img-wrap--placeholder')" />
    <div class="obra__overlay">
      <button class="obra__ver">Ver obra</button>
    </div>
  </div>
  <div class="obra__info">
    <h3 class="obra__titulo">Nombre del cuadro</h3>
    <p class="obra__tipo">Técnica utilizada</p>
  </div>
</div>
```

> Pon tu imagen en `images/gallery/` con el nombre que uses en `src`.

## Cambiar el nombre "SefArte"

Busca y reemplaza **SefArte** en todos los archivos por tu nombre definitivo.
En VSCode: `Ctrl+Shift+H` → buscar `SefArte` → reemplazar por tu nombre.

## Abrir en el navegador

Haz doble clic en `index.html`, o usa una extensión como **Live Server** en VSCode
para verla con recarga automática.

## Colores del tema (CSS Variables)

Edita `css/style.css` al inicio para personalizar:

| Variable       | Uso                       | Valor por defecto |
|----------------|---------------------------|-------------------|
| `--c-bg`       | Fondo general             | `#faf8f4`         |
| `--c-accent`   | Color principal (marrón)  | `#8b4513`         |
| `--c-gold`     | Detalles dorados          | `#b89a4a`         |
| `--c-text`     | Texto principal           | `#2c2416`         |
