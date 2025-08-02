import { getImageData } from '../utils/fetchUtils.js';
import { createImageGrid, appendThumbnails, renderGrid } from '../utils/gridUtils.js';
import { setTextById } from '../utils/domUtils.js';

/**
 * Attaches a click listener to the back button in series view.
 * @param {string} targetPage
 */
function backButton(targetPage) {
  const backBtn = document.getElementById('navigation-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = targetPage;
    });
  }
}

/**
 * Sets up series-view page: metadata, photo count, grid and lightbox.
 * @param {Array} seriesList
 */
export async function setupSeriesViewPage(seriesList) {
  const params = new URLSearchParams(window.location.search);
  const seriesId = Number(params.get('series_id')) || 0;
  const currentSeries = seriesList.find(s => s.series_id === seriesId);
  const images = await getImageData({ seriesId });
  const seriesName = currentSeries?.series_name || '';
  const seriesDesc = currentSeries?.series_description || '';

  setTextById('series-title', seriesName);
  setTextById('series-description', seriesDesc);
  setTextById('series-photo-count', `${images.length} photo${images.length !== 1 ? 's' : ''}`);

  createImageGrid(images, '.series-view', 'grid-item');
  appendThumbnails(images, '.series-view', '.grid-item', 'blur-load');
  await renderGrid(images, '.series-view', 'grid-item', 'blur-load', true);

  backButton('series.html')
}
