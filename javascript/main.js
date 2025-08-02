import { updateCurrentYear, markProfileLoaded } from './utils/domUtils.js';
import { getSeriesList } from './utils/fetchUtils.js';
import { setupHomePage } from './pages/home.js';
import { setupSeriesListPage } from './pages/series.js';
import { setupSeriesViewPage } from './pages/SeriesView.js';

/**
 * Get current filename from URL.
 * @returns {string}
 */
function getCurrentFilename() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    updateCurrentYear();
    markProfileLoaded();

    const seriesList = await getSeriesList();
    const file = getCurrentFilename();

    if (!file || file === 'index.html') {
      await setupHomePage('.grid');
    } else if (file === 'series.html') {
      await setupSeriesListPage(seriesList, '.series');
    } else if (file === 'series-view.html') {
      await setupSeriesViewPage(seriesList);
    }
  } catch (err) {
    console.error('Error during setup:', err);
  }
});
