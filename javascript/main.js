import { fetchImageData,
         fetchSeriesId,
         testConnectionSpeed } from './imageDataUtils.js';

import { populateCurrentYear,
         applyLoadedClassToProfileImage } from './domUtils.js';

import { renderGridPlaceholders,
         renderThumbnailPlaceholders,
         renderSeriesCards,
         populateGridWithHighResImages,
         populateSeriesTitle,
         populateSeriesDescription,
         populateSeriesPhotoCount } from './gridRenderer.js';

import { loadLightboxHTML,
         initializeLightbox } from './lightboxManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1);
  const urlParam = new URLSearchParams(window.location.search);
  const seriesId = Number(urlParam.get('series_id'));

  const allImages = await fetchImageData({}); // All images
  const homepageImages = await fetchImageData({ homepageOnly: true }); // Homepage images only
  const seriesImages = await fetchImageData({seriesId: seriesId}); // Serie images only
  const seriesList = await fetchSeriesId();

  populateCurrentYear();
  applyLoadedClassToProfileImage();

  const slow = await testConnectionSpeed(allImages[0]?.src);

  try {
    if (!file || file === 'index.html') {
      renderGridPlaceholders(homepageImages, '.grid', 'grid-item');

      if (slow) renderThumbnailPlaceholders(homepageImages, '.grid-item', 'blur-load');

      await populateGridWithHighResImages(homepageImages, '.grid-item', 'blur-load');

      await loadLightboxHTML();
      initializeLightbox(homepageImages);
    }

    if (file === 'series.html') {
      await renderSeriesCards(seriesList, fetchImageData, '.series')
    }

    if (file === 'series-view.html') {
      goPageBack('series.html');

      populateSeriesTitle('series-title', seriesList[seriesId - 1].series_name, false);
      populateSeriesDescription('series-description', seriesList[seriesId - 1].series_description, false);
      populateSeriesPhotoCount('series-photo-count', seriesImages.length, false);

      renderGridPlaceholders(seriesImages, '.series-view', 'grid-item');

      if (slow) renderThumbnailPlaceholders(seriesImages, '.grid-item', 'blur-load');

      await populateGridWithHighResImages(seriesImages, '.grid-item', 'blur-load');

      await loadLightboxHTML();
      initializeLightbox(seriesImages);
    }
  } catch (err) {
      console.error('Error during setup:', err);
  }
});

function goPageBack(page) {
  const backBtn = document.getElementById('navigation-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = page;
    });
  }
}