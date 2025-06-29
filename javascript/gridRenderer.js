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
    item.dataset.index = img.image_id;
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

export async function renderSeriesCards(seriesList, fetchImageDataFn, containerSelector) {
  const seriesSection = document.querySelector(containerSelector);
  if (!seriesSection) return;
  
  for (const series of seriesList) {
    const images = await fetchImageDataFn({ seriesId: series.series_id });

    const link = document.createElement('a');
    link.href = `series-view.html?series_id=${series.series_id}`;
    link.className = 'series-card-link';

    const container = document.createElement('div');
    container.className = 'series-cards-container';

    const card = document.createElement('div');
    card.className = `series-card ${series.series_name.toLowerCase().replace(/\s+/g, '-')}`;

    const cardInfo = document.createElement('div');
    cardInfo.className = 'series-card-info';

    populateSeriesTitle('series-card-title', series.series_name, true, cardInfo);
    populateSeriesDescription('series-card-description', series.series_description, true, cardInfo);
    populateSeriesPhotoCount('series-card-photo-count', images.length, true, cardInfo);

    const photoCount = document.createElement('div');
    photoCount.className = 'series-card-photo-count';
    photoCount.textContent = `${images.length} photos`;

    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'series-card-images';

    images.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || '';
      img.className = 'series-card-grid-item';
      imagesContainer.appendChild(img);
    });

    card.appendChild(cardInfo);
    card.appendChild(imagesContainer);
    container.appendChild(card);
    link.appendChild(container);
    seriesSection.appendChild(link);

    const elements = document.querySelectorAll('.series-card-images');

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const el = entry.target;
        const width = entry.contentRect.width;
        el.style.setProperty('--series-card-width', `${width}px`);
      }
    });

    elements.forEach(el => observer.observe(el));
  }
}

export async function populateSeriesTitle(className, seriesName, isAppend, parent) {
  if (isAppend) {
    const title = document.createElement('div');
    title.className = className;
    title.textContent = seriesName;
    parent.appendChild(title);
  } else if (!isAppend) {
    const title = document.querySelector('.' + className);
    title.textContent = seriesName;
  }
}

export async function populateSeriesDescription(className, seriesDescription, isAppend, parent) {
  if (isAppend) {
      const description = document.createElement('div');
      description.className = className;
      description.textContent = seriesDescription;
      parent.appendChild(description);
  } else if (!isAppend) {
      const description = document.querySelector('.' + className);
      description.textContent = seriesDescription;
  }
}

export async function populateSeriesPhotoCount(className, count, isAppend, parent) {
  const label = `${count} photo${count === 1 ? '' : 's'}`;

  if (isAppend) {
    const photoCount = document.createElement('div');
    photoCount.className = className;
    photoCount.textContent = label;
    parent.appendChild(photoCount);
  } else if (!isAppend) {
      const photoCount = document.querySelector('.' + className);
      photoCount.textContent = label;
  }
}


/**
 * Inserts high-res images and overlays into each grid item,
 * replacing thumbnails once loaded.
 */
export function populateGridWithHighResImages(imageList, itemSelector, wrapperClassName) {
  return new Promise(resolve => {
    const items = document.querySelectorAll(itemSelector);

    const imageMap = new Map();
    imageList.forEach(img => imageMap.set(String(img.image_id), img));

    const insert = () => {
      items.forEach(item => {
        const id = item.dataset.index;
        const imgData = imageMap.get(id);
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