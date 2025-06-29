import { populateCurrentYear } from './domUtils.js';

let currentIndex = 0;

export async function loadLightboxHTML(containerId = 'lightbox-container', path = 'assets/lightbox.html') {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load lightbox HTML');
  const html = await res.text();
  document.getElementById(containerId).innerHTML = html;
}

export function initializeLightbox(imageList) {
  const lightbox = document.getElementById('lightbox');
  const imageWrapper = document.getElementById('lightbox-image');
  const bgOverlay = document.getElementById('lightbox-image-background');

  if (!lightbox || !imageWrapper || !bgOverlay) return;

  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const imageId = Number(item.dataset.index);
      if (Number.isNaN(imageId)) return;

      const image = imageList.find(img => img.image_id === imageId);
      const index = imageList.findIndex(img => img.image_id === imageId);

      if (!image || index === -1) return;

      currentIndex = index;
      showImage(imageList[currentIndex], imageWrapper, bgOverlay);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.getElementById('navigation-close')?.addEventListener('click', closeLightbox);
  document.getElementById('navigation-next')?.addEventListener('click', () => navigateImage(imageList, +1));
  document.getElementById('navigation-prev')?.addEventListener('click', () => navigateImage(imageList, -1));
}

function showImage(image, imageWrapper, bgOverlay) {
  if (!image) return;
  console.log(image);

  imageWrapper.innerHTML = ''; // Clear old content

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

function populateExifInfo(image) {
  const { exif = {} } = image;

  const titleEl = document.getElementById('title');
  const camEl = document.getElementById('camera');
  const lensEl = document.getElementById('lens');
  const settingsEl = document.getElementById('settings');
  const locEl = document.getElementById('location');
  const dateEl = document.getElementById('date');

  if (titleEl) titleEl.textContent = image.title || '';
  if (camEl) camEl.textContent = exif.camera || '';
  if (lensEl) lensEl.textContent = exif.lens || '';

  if (settingsEl) {
    const settings = [
      exif.focal,
      exif.aperture,
      exif.shutter,
      exif.iso ? `ISO ${exif.iso}` : null
    ].filter(Boolean);

    settingsEl.innerHTML = settings
      .map(val => `<span class="setting-part">${val}</span>`)
      .join('<span class="dot"> • </span>');
  }

  if (locEl) locEl.textContent = image.location || '';
  if (dateEl) dateEl.textContent = image.date || '';
}

function navigateImage(imageList, direction) {
  if (!Array.isArray(imageList) || imageList.length === 0) return;

  currentIndex = (currentIndex + direction + imageList.length) % imageList.length;

  const imageWrapper = document.getElementById('lightbox-image');
  const bgOverlay = document.getElementById('lightbox-image-background');

  if (!imageWrapper || !bgOverlay) return;

  showImage(imageList[currentIndex], imageWrapper, bgOverlay);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}