import { createLazyImage, onLoadImage } from './domUtils.js';
import { initLightbox } from './lightboxUtils.js';

/**
 * Creates placeholders based on aspect ratio.
 */
export function createImageGrid(imageList, gridSelector, itemClass) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  imageList.forEach(img => {
    const ratio = (img.dimensions.height / img.dimensions.width) * 100;
    const placeholder = document.createElement('div');
    placeholder.className = itemClass;
    placeholder.dataset.index = img.image_id;
    placeholder.style.setProperty('--aspect-ratio', `${ratio}%`);
    grid.appendChild(placeholder);
  });
}

/**
 * Adds blurred thumbnail placeholders for slow connections.
 */
export function appendThumbnails(imageList, gridSelector, itemSelector, placeholderClass) {
  const grid = document.querySelector(gridSelector);
  grid?.querySelectorAll(itemSelector).forEach((item, index) => {
    const thumb = imageList[index]?.thumbnail;
    if (thumb) {
      const blur = document.createElement('div');
      blur.className = placeholderClass;
      blur.style.backgroundImage = `url(${thumb})`;
      item.appendChild(blur);
    }
  });
}

/**
 * Populates images into the grid, attaches lazy loading and load events.
 */
export async function renderGrid(imageList, gridSelector, placeholderClass, blurClassName, useHoverOverlay = true) {
  // Wrap each placeholder with img and overlay content
  const parent = document.querySelector(gridSelector);
  if (!parent) return;

  const items = parent.querySelectorAll(`.${placeholderClass}`);
  items.forEach((item, idx) => {
    const image = imageList[idx];
    const wrapper = document.createElement('div');
    wrapper.className = blurClassName;
    const img = createLazyImage(image.src, image.alt);
    wrapper.appendChild(img);

    if (useHoverOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'grid-overlay';
      const content = document.createElement('div');
      content.className = 'content-overlay';

      ['hover-overlay-1','hover-overlay-2','hover-overlay-3','hover-overlay-4'].forEach(cn => {
        content.appendChild(document.createElement('div')).className = cn;
      });

      const title = document.createElement('p');
      title.className = 'grid-title';
      title.textContent = 'Loading...';

      const date = document.createElement('p');
      date.className = 'grid-date';

      content.append(title, date);
      overlay.append(content);
      wrapper.append(overlay);

      const onLoadImage = () => {
        wrapper.classList.add('loaded');
        if (title && date) {
          title.textContent = image.title || '';
          date.textContent = image.date || '';
        }
      };
      img.addEventListener('load', onLoadImage);
      if (img.complete && img.naturalHeight) onLoadImage();
    }

    if (!useHoverOverlay) {
      const onLoadImage = () => {
        wrapper.classList.add('loaded');
      };
      img.addEventListener('load', onLoadImage);
      if (img.complete && img.naturalHeight) onLoadImage();
    }

    item.appendChild(wrapper);
  });

  initLightbox(imageList, { containerId: 'lightbox-container', htmlPath: 'assets/lightbox.html' });
}