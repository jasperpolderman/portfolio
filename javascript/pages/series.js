import { getImageData, isSlowConnection } from '../utils/fetchUtils.js';
import { createImageGrid, appendThumbnails, renderGrid } from '../utils/gridUtils.js';

/**
 * Renders series listing page with cards per series.
 * @param {Array} seriesList
 * @param {string} containerSelector
 */
export async function setupSeriesListPage(seriesList, parentSelector) {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  const imageJobs = []; // Store deferred image loading tasks

  for (const series of seriesList) {
    // Create DOM elements
    const wrapper = document.createElement('a');
    wrapper.className = 'series-card-link';
    wrapper.href = `series-view.html?series_id=${series.series_id}`;

    const container = document.createElement('div');
    container.className = 'series-cards-container';

    const card = document.createElement('div');
    card.className = `series-card ${series.series_name.replace(/\s+/g, '-').toLowerCase()}`;

    const info = document.createElement('div');
    info.className = 'series-card-info';
    info.innerHTML = `
      <div class="series-card-title">${series.series_name}</div>
      <div class="series-card-description">${series.series_description}</div>
      <div class="series-card-photo-count">Loading photos...</div>`;

    const grid = document.createElement('div');
    grid.className = `series-card-images ${series.series_name.replace(/\s+/g, '-').toLowerCase()}`;

    // Append to DOM
    parent.appendChild(wrapper);
    wrapper.appendChild(container);
    container.appendChild(card);
    card.append(info, grid);

    // Queue image loading task
    const gridSelector = grid.className.split(' ').map(cls => `.${cls}`).join('');
    const placeholderClass = 'series-card-grid-item';
    const blurrClassName = 'blur-load';

    imageJobs.push((async () => {
      const images = await getImageData({ seriesId: series.series_id });
      const slow = images[0] ? await isSlowConnection(images[0].src) : false;

      // Update photo count
      info.querySelector('.series-card-photo-count').textContent =
        `${images.length} photo${images.length !== 1 ? 's' : ''}`;

      createImageGrid(images, gridSelector, placeholderClass);
      if (slow) appendThumbnails(images, gridSelector, `.${placeholderClass}`, blurrClassName);
      await renderGrid(images, gridSelector, placeholderClass, blurrClassName, false);
    })());
  }

  // Wait for all image jobs after DOM creation
  await Promise.all(imageJobs);
}