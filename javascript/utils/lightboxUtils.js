import { createLazyImage, updateCurrentYear, setTextById, onLoadImage } from './domUtils.js';

let currentIndex = 0;
let imageDisplayToken = 0; // Global token to manage cancellation

/**
 * Loads lightbox HTML fragment.
 */
async function loadLightboxHtml(containerId, htmlPath) {
  const res = await fetch(htmlPath);
  if (!res.ok) throw new Error('Failed to load lightbox HTML');
  document.getElementById(containerId).innerHTML = await res.text();
}

/**
 * Populates EXIF info into UI.
 */
function populateExifData(image) {
  setTextById('title', image.title);
  setTextById('camera', image.exif.camera || '');
  setTextById('lens', image.exif.lens || '');
  setTextById('location', image.location || '');
  setTextById('date', image.date || '');

  const parts = [image.exif.focal, image.exif.aperture, image.exif.shutter, image.exif.iso ? `ISO ${image.exif.iso}` : null].filter(Boolean);
  const html = parts.map(p => `<span class="setting-part">${p}</span>`).join('<span class="dot"> • </span>');
  document.getElementById('settings').innerHTML = html;
}

/**
 * Displays image and overlays inside lightbox, with cancellation handling.
 */
async function displayLightboxImage(image, wrapperEl, bgOverlayEl) {
  const thisToken = ++imageDisplayToken; // Increment token for each request
  
  populateExifData(image);
  updateCurrentYear();

  wrapperEl.innerHTML = '';

  if (image.thumbnail) {
    const thumbName = image.thumbnail.split('/').pop();
    bgOverlayEl.style.setProperty('--lightbox-bg', `url('../images/placeholders/${thumbName}')`);
  }

  const img = createLazyImage(image.src, image.alt);

  try {
    await onLoadImage(wrapperEl, img);
  } catch (e) {
    return; // Silently fail on load error
  }

  if (thisToken !== imageDisplayToken) return;

  wrapperEl.appendChild(img);
}

/**
 * Setup click listeners on thumbnail grid items for opening lightbox.
 */
function setupClickHandlers(imageList, wrapperEl, bgOverlayEl, lightboxEl) {
  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = Number(item.dataset.index);
      const idx = imageList.findIndex(img => img.image_id === id);
      if (idx >= 0) {
        currentIndex = idx;
        displayLightboxImage(imageList[idx], wrapperEl, bgOverlayEl);
        lightboxEl.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

/**
 * Setup navigation (prev/next/close) controls.
 */
function setupNavigationControls(imageList, wrapperEl, bgOverlayEl, lightboxEl) {
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) close(); });

  document.getElementById('navigation-close')?.addEventListener('click', close);
  document.getElementById('navigation-next')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imageList.length;
    displayLightboxImage(imageList[currentIndex], wrapperEl, bgOverlayEl);
  });
  document.getElementById('navigation-prev')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    displayLightboxImage(imageList[currentIndex], wrapperEl, bgOverlayEl);
  });

  function close() {
    lightboxEl.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Initializes lightbox with binding and HTML loading.
 * @param {Array} imageList
 * @param {Object} options
 */
export async function initLightbox(imageList, { containerId, htmlPath }) {
  if (!containerId || !htmlPath) throw new Error('initLightbox requires containerId and htmlPath');
  await loadLightboxHtml(containerId, htmlPath);
  await new Promise(requestAnimationFrame);

  const lightboxEl = document.getElementById('lightbox');
  const wrapperEl = document.getElementById('lightbox-image');
  const bgOverlayEl = document.getElementById('lightbox-image-background');
  if (!lightboxEl || !wrapperEl || !bgOverlayEl) return;

  setupClickHandlers(imageList, wrapperEl, bgOverlayEl, lightboxEl);
  setupNavigationControls(imageList, wrapperEl, bgOverlayEl, lightboxEl);
}