import { fetchImageData, testConnectionSpeed } from './imageDataUtils.js';
import { populateCurrentYear, applyLoadedClassToProfileImage } from './domUtils.js';
import { renderGridPlaceholders, renderThumbnailPlaceholders, populateGridWithHighResImages } from './gridRenderer.js';
import { loadLightboxHTML, initializeLightbox } from './lightboxManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1);

  const allImages     = await fetchImageData({}); // All images
  const homepageImages = await fetchImageData({ homepageOnly: true }); // Homepage-only

  populateCurrentYear();
  applyLoadedClassToProfileImage();

  try {
    if (!file || file === 'index.html') {
      const slow = await testConnectionSpeed(allImages[0]?.src);
      renderGridPlaceholders(homepageImages, '.grid', 'grid-item');

      if (slow) renderThumbnailPlaceholders(homepageImages, '.grid-item', 'blur-load');

      await populateGridWithHighResImages(allImages, '.grid-item', 'blur-load');

      await loadLightboxHTML();
      initializeLightbox(homepageImages);
    }

    if (file === 'series.html') {
      // Additional logic for series page here...
    }
  } catch (err) {
    console.error('Error during setup:', err);
  }
});