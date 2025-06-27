import { createLazyImage } from './domUtils.js';

/**
 * Renders empty placeholder divs into a CSS grid container,
 * sized using the image dimensions to maintain aspect ratio.
 */
export function renderGridPlaceholders(imageList, gridSelector, itemClassName) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  imageList.forEach(img => {
    const ratio = (img.dimensions.height / img.dimensions.width) * 100;
    const item = document.createElement('div');
    item.classList.add(itemClassName);
    item.dataset.index = img.imageId;
    item.style.setProperty('--aspect-ratio', `${ratio}%`);
    grid.appendChild(item);
  });
}

/**
 * Adds thumbnail placeholder background images
 * to each grid item (blur placeholder loading).
 */
export function renderThumbnailPlaceholders(imageList, itemSelector, thumbClassName) {
  document.querySelectorAll(itemSelector).forEach((item, idx) => {
    const thumbUrl = imageList[idx]?.thumbnail;
    if (!thumbUrl) return;

    const placeholder = document.createElement('div');
    placeholder.classList.add(thumbClassName);
    placeholder.style.backgroundImage = `url(${thumbUrl})`;
    item.appendChild(placeholder);
  });
}

/**
 * Inserts high-res images and overlays into each grid item,
 * replacing thumbnails once loaded.
 */
export function populateGridWithHighResImages(imageList, itemSelector, wrapperClassName) {
  return new Promise(resolve => {
    const items = document.querySelectorAll(itemSelector);

    const insert = () => {
      items.forEach(item => {
        const idx = Number(item.dataset.index) - 1;
        const imgData = imageList[idx];
        if (!imgData) return;

        let wrapper = item.querySelector(`.${wrapperClassName}`);
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.classList.add(wrapperClassName);
          item.appendChild(wrapper);
        }

        const img = createLazyImage(imgData.src, imgData.alt);
        const title = Object.assign(document.createElement('p'), { className: 'grid-title', textContent: 'Loading...' });
        const date = Object.assign(document.createElement('p'), { className: 'grid-date', textContent: '' });

        const overlay = document.createElement('div');
        overlay.classList.add('grid-overlay');
        const content = document.createElement('div');
        content.classList.add('content-overlay');
        ['hover-overlay-1','hover-overlay-2','hover-overlay-3','hover-overlay-4'].forEach(cn => content.appendChild(document.createElement('div')).classList.add(cn));
        content.append(title, date);
        overlay.appendChild(content);

        wrapper.append(img, overlay);

        img.addEventListener('load', () => {
          wrapper.classList.add('loaded');
          title.textContent = imgData.title || '';
          date.textContent = imgData.date || '';
        });

        img.addEventListener('error', () => {
          title.textContent = 'Image failed to load';
          date.textContent = '';
        });
      });
      resolve();
    };

    if ('requestIdleCallback' in window) requestIdleCallback(insert);
    else setTimeout(insert, 200);
  });
}