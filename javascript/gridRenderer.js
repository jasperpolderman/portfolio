import { createLazyImage } from './domUtils.js';

/**
 * Helper to create an element with class and optional text content.
 * @param {string} tag - HTML tag name.
 * @param {string} className - CSS class to apply.
 * @param {string} [text] - Optional text content.
 * @returns {HTMLElement}
 */
const createElementWithClassAndText = (tag, className, text = '') => {
  const el = document.createElement(tag);
  el.className = className;
  if (text) el.textContent = text;
  return el;
}

/**
 * Renders placeholder divs inside a grid based on aspect ratio of images.
 * @param {Array} imageList - Array of image objects.
 * @param {string} gridSelector - CSS selector for the grid container.
 * @param {string} itemClass - Class name to apply to each placeholder item.
 */
export function renderGridPlaceholders (imageList, gridSelector, itemClass) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  imageList.forEach(image => {
    const ratio = (image.dimensions.height / image.dimensions.width) * 100;
    const placeholder = createElementWithClassAndText('div', itemClass);
    placeholder.dataset.index = image.image_id;
    placeholder.style.setProperty('--aspect-ratio', `${ratio}%`);
    grid.appendChild(placeholder);
  });
}

/**
 * Adds blurred background placeholders for thumbnails.
 * @param {Array} imageList - Array of image objects.
 * @param {string} itemSelector - Selector for grid items.
 * @param {string} blurClass - Class name for the blur wrapper.
 */
export function renderThumbnailPlaceholders (imageList, itemSelector, blurClass) {
  document.querySelectorAll(itemSelector).forEach((item, index) => {
    const image = imageList[index];
    if (!image?.thumbnail) return;

    const blur = document.createElement('div');
    blur.classList.add(blurClass);
    blur.style.backgroundImage = `url(${image.thumbnail})`;

    item.appendChild(blur);
  });
}

/**
 * Replaces placeholders with high-resolution images inside grid items.
 * @param {Array} imageList - Array of image objects.
 * @param {string} itemSelector - Selector for grid items.
 * @param {string} blurClass - Class to apply to blur wrapper
 * @returns {Promise<void>}
 */
export async function populateGridWithHighResImages (imageList, itemSelector, blurClass) {
  const items = document.querySelectorAll(itemSelector);
  const imageMap = new Map(imageList.map(({ image_id, ...rest }) => [String(image_id), rest]));

  for (const item of items) {
    const imageId = item.dataset.index;
    const imageData = imageMap.get(imageId);
    if (!imageData) continue;

    const wrapper = document.createElement('div');
    wrapper.classList.add(blurClass);

    const img = createLazyImage(imageData.src, imageData.alt || '');
    wrapper.appendChild(img);

    const overlay = document.createElement('div');
    overlay.classList.add('grid-overlay');

    const hoverOverlay = createHoverOverlay(imageData.title, imageData.date, false);
    overlay.appendChild(hoverOverlay)
    wrapper.appendChild(overlay);
    item.appendChild(wrapper);

    const updateOverlayContent = () => {
      wrapper.classList.add('loaded');
      hoverOverlay.querySelector('.grid-title').textContent = imageData.title || '';
      hoverOverlay.querySelector('.grid-date').textContent = imageData.date || '';
    };

    // Handle cached images 
    if (img.complete && img.naturalHeight !== 0) {
      updateOverlayContent();
    } else {
      img.addEventListener('load', updateOverlayContent);
    }
  }
}

/**
 * Creates the overlay element with hover classes and text nodes for title, date, and description.
 * @param {string} [title=''] - The title text to display.
 * @param {string} [date=''] - The date text to display.
 * @returns {{ overlay: HTMLElement, title: HTMLElement, date: HTMLElement }} The overlay and text elements.
 */
function createHoverOverlay(title = '', date = '', isLoaded = false) {
  const content = document.createElement('div');
  content.classList.add('content-overlay');

  ['hover-overlay-1', 'hover-overlay-2', 'hover-overlay-3', 'hover-overlay-4'].forEach(className => {
    const layer = document.createElement('div');
    layer.classList.add(className);
    content.appendChild(layer);
  });

  const titleEl = document.createElement('p');
  titleEl.className = 'grid-title';
  titleEl.textContent = isLoaded ? title : 'Loading...';

  const dateEl = document.createElement('p');
  dateEl.className = 'grid-date';
  dateEl.textContent = isLoaded ? date : '';

  content.appendChild(titleEl);
  content.appendChild(dateEl);

  return content;
}

/**
 * Renders series cards dynamically with image previews.
 * @param {Array} seriesList - List of series metadata.
 * @param {Function} fetchImageData - Function to fetch image data by seriesId.
 * @param {string} containerSelector - Container to inject series cards into.
 */
export async function renderSeriesCards (seriesList, fetchImageData, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  for (const series of seriesList) {
    const images = await fetchImageData({ seriesId: series.series_id });

    const link = createElementWithClassAndText('a', 'series-card-link');
    link.href = `series-view.html?series_id=${series.series_id}`;

    const cardContainer = createElementWithClassAndText('div', 'series-cards-container');
    const card = createElementWithClassAndText('div', `series-card ${series.series_name.toLowerCase().replace(/\s+/g, '-')}`);

    const info = createElementWithClassAndText('div', 'series-card-info');
    populateSeriesTitle('series-card-title', series.series_name, true, info);
    populateSeriesDescription('series-card-description', series.series_description, true, info);
    populateSeriesPhotoCount('series-card-photo-count', images.length, true, info);

    const imageGrid = createElementWithClassAndText('div', 'series-card-images');
    images.forEach(img => {
      const preview = document.createElement('img');
      preview.src = img.src;
      preview.alt = img.alt || '';
      preview.classList.add('series-card-grid-item');
      imageGrid.appendChild(preview);
    });

    // Observe width for dynamic CSS sizing
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const el = entry.target;
        el.style.setProperty('--series-card-width', `${entry.contentRect.width}px`);
      }
    });
    observer.observe(imageGrid);

    card.append(info, imageGrid);
    cardContainer.appendChild(card);
    link.appendChild(cardContainer);
    container.appendChild(link);
  }
}

/**
 * Populates or updates the series title element.
 * @param {string} className - Class of the target element.
 * @param {string} seriesName - Series name.
 * @param {boolean} isAppend - Wether to append or replace
 * @param {HTMLElement} [parent] - Parent element if appending. 
 */
export function populateSeriesTitle (className, seriesName, isAppend, parent) {
  if (isAppend && parent) {
      const title = createElementWithClassAndText('div', className, seriesName);
      parent.appendChild(title);
  } else {
      const title = document.querySelector(`.${className}`);
      if (title) title.textContent = seriesName;
  }
}

/**
 * Populates or updates the series description element.
 * @param {string} className
 * @param {string} seriesDescription
 * @param {boolean} isAppend
 * @param {HTMLElement} [parent]
 */
export function populateSeriesDescription (className, seriesDescription, isAppend, parent) {
  if (isAppend && parent) {
      const desc = createElementWithClassAndText('div', className, seriesDescription);
      parent.appendChild(desc);
  } else {
      const desc = document.querySelector(`.${className}`);
      if (desc) desc.textContent = seriesDescription;
  }
}

/**
 * Populates or updates the photo count label element.
 * @param {string} className
 * @param {number} count
 * @param {boolean} isAppend
 * @param {HTMLElement} [parent]
 */
export function populateSeriesPhotoCount (className, count, isAppend, parent) {
  const label = `${count} photo${count === 1 ? '' : 's'}`;
  if (isAppend && parent) {
      const photoCount = createElementWithClassAndText('div', className, label);
      parent.appendChild(photoCount);
  } else {
      const photoCount = document.querySelector(`.${className}`);
      if (photoCount) photoCount.textContent = label;
  }
}