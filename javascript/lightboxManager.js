import { populateCurrentYear } from './domUtils.js';

let currentIndex = 0;

/**
 * Loads the lightbox HTML content into the container.
 * @param {string} containerId - The ID of the container to populate.
 * @param {string} path - Path to the lightbox HTML fragment.
 */
export async function loadLightboxHTML(containerId = 'lightbox-container', path = 'assets/lightbox.html') {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load lightbox HTML');
  const html = await res.text();
  document.getElementById(containerId).innerHTML = html;
}

/**
 * Initializes the lightbox functionality for a given image list.
 * @param {Array} imageList - List of enriched image objects.
 */
export function initializeLightbox(imageList) {
  const lightbox = document.getElementById('lightbox');
  const imageWrapper = document.getElementById('lightbox-image');
  const bgOverlay = document.getElementById('lightbox-image-background');

  if (!lightbox || !imageWrapper || !bgOverlay) return;

  setupImageClickHandlers(imageList, imageWrapper, bgOverlay, lightbox);
  setupNavigationControls(imageList, imageWrapper, bgOverlay, lightbox);
}

/**
 * Attaches click handlers to image grid items.
 */
function setupImageClickHandlers(imageList, imageWrapper, bgOverlay, lightbox) {
  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const imageId = Number(item.dataset.index);
      if (Number.isNaN(imageId)) return;

      const index = imageList.findIndex(img => img.image_id === imageId);
      const image = imageList[index];

      if (!image || index === -1) return;

      currentIndex = index;
      showImage(image, imageWrapper, bgOverlay);
      openLightbox(lightbox);
    });
  });
}

/**
 * Attaches handlers for close and navigation buttons.
 */
function setupNavigationControls(imageList, imageWrapper, bgOverlay, lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.getElementById('navigation-close')?.addEventListener('click', closeLightbox);
  document.getElementById('navigation-next')?.addEventListener('click', () => navigateImage(imageList, +1, imageWrapper, bgOverlay));
  document.getElementById('navigation-prev')?.addEventListener('click', () => navigateImage(imageList, -1, imageWrapper, bgOverlay));
}

/**
 * Displays an image in the lightbox.
 */
function showImage(image, imageWrapper, bgOverlay) {
  if (!image) return;

  imageWrapper.innerHTML = '';

  const img = document.createElement('img');
  img.src = image.src;
  imageWrapper.appendChild(img);

  if (image.thumbnail) {
    const bgUrl = `url('../images/placeholders/${image.thumbnail.split('/').pop()}')`;
    bgOverlay.style.setProperty('--lightbox-bg', bgUrl);
  }

  populateExifInfo(image);
  populateCurrentYear();
}

/**
 * Populates EXIF and metadata info in the lightbox.
 */
function populateExifInfo(image) {
  const { exif = {} } = image;

  setText('title', image.title);
  setText('camera', exif.camera.camera_name);
  setText('lens', exif.lens.lens_name);
  setText('location', image.location);
  setText('date', image.date);

  const settings = [
    exif.focal,
    exif.aperture,
    exif.shutter,
    exif.iso ? `ISO ${exif.iso}` : null
  ].filter(Boolean);

  const settingsHtml = settings
    .map(val => `<span class="setting-part">${val}</span>`)
    .join('<span class="dot"> • </span>');

  const settingsEl = document.getElementById('settings');
  if (settingsEl) settingsEl.innerHTML = settingsHtml;
}

/**
 * Updates the content of a DOM element.
 */
function setText(id, text = '') {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Navigates forward or backward in the image list.
 */
function navigateImage(imageList, direction, imageWrapper, bgOverlay) {
  if (!Array.isArray(imageList) || imageList.length === 0) return;

  currentIndex = (currentIndex + direction + imageList.length) % imageList.length;
  showImage(imageList[currentIndex], imageWrapper, bgOverlay);
}

/**
 * Opens the lightbox.
 */
function openLightbox(lightbox) {
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the lightbox.
 */
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}