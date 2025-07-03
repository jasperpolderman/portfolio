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

// Main entry point
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const file = getCurrentPageFilename();
    const seriesId = getSeriesIdFromUrl();

    const allImages = await fetchImageData({});
    const homepageImages = await fetchImageData({ homepageOnly: true });
    const seriesImages = await fetchImageData({ seriesId });
    const seriesList = await fetchSeriesId();

    const isSlowConnection = await testConnectionSpeed(allImages[0]?.src);

    populateCurrentYear();
    applyLoadedClassToProfileImage();

    if (!file || file === 'index.html') {
      await setupHomepage(homepageImages, isSlowConnection);
    }

    if (file === 'series.html') {
      await setupSeriesList(seriesList);
    }

    if (file === 'series-view.html') {
      await setupSeriesView(seriesList, seriesImages, seriesId, isSlowConnection);
    }

  } catch (err) {
    console.error('Error during setup:', err);
  }
});

/**
 * Returns the current filename from the URL.
 */
function getCurrentPageFilename() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

/**
 * Extracts the series ID from the URL query params.
 */
function getSeriesIdFromUrl() {
  const urlParam = new URLSearchParams(window.location.search);
  return Number(urlParam.get('series_id')) || 0;
}

/**
 * Handles rendering and lightbox setup for the homepage.
 */
async function setupHomepage(images, isSlow) {
  renderGridPlaceholders(images, '.grid', 'grid-item');

  if (isSlow) {
    renderThumbnailPlaceholders(images, '.grid-item', 'blur-load');
  }

  await populateGridWithHighResImages(images, '.grid-item', 'blur-load');
  await loadLightboxHTML();
  initializeLightbox(images);
}

/**
 * Renders the series overview cards.
 */
async function setupSeriesList(seriesList) {
  await renderSeriesCards(seriesList, fetchImageData, '.series');
}

/**
 * Handles everything for a single series view.
 */
async function setupSeriesView(seriesList, images, seriesId, isSlow) {
  setupBackButton('series.html');

  const currentSeries = seriesList[seriesId - 1];

  if (currentSeries) {
    populateSeriesTitle('series-title', currentSeries.series_name, false);
    populateSeriesDescription('series-description', currentSeries.series_description, false);
  }

  populateSeriesPhotoCount('series-photo-count', images.length, false);
  renderGridPlaceholders(images, '.series-view', 'grid-item');

  if (isSlow) {
    renderThumbnailPlaceholders(images, '.grid-item', 'blur-load');
  }

  await populateGridWithHighResImages(images, '.grid-item', 'blur-load');
  await loadLightboxHTML();
  initializeLightbox(images);
}

/**
 * Attaches a click listener to the back button in series view.
 * @param {string} targetPage - Page to return to.
 */
function setupBackButton(targetPage) {
  const backBtn = document.getElementById('navigation-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = targetPage;
    });
  }
}