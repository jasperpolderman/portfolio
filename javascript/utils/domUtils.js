/**
 * Creates an <img> element with lazy-loading and async decoding.
 * @param {string} src
 * @param {string} alt
 * @returns {HTMLImageElement}
 */
export function createLazyImage(src, alt = '') {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

/**
 * Inserts the current year into all elements matching selector.
 * @param {string} selector
 */
export function updateCurrentYear(selector = '.currentYear') {
  const year = new Date().getFullYear();
  document.querySelectorAll(selector).forEach(el => { el.textContent = year; });
}

/**
 * Adds 'loaded' class to profile picture wrapper when image finishes loading.
 * @param {string} imageSelector
 * @param {string} wrapperClass
 */
export function markProfileLoaded(imageSelector = '.profile-picture', wrapperClass = 'blur-load') {
  const img = document.querySelector(imageSelector);
  const wrapper = img?.closest(`.${wrapperClass}`);
  const mark = () => wrapper?.classList.add('loaded');
  img?.addEventListener('load', mark);
  if (img?.complete && img.naturalWidth) mark();
}

/**
 * Sets element text by ID if exists.
 * @param {string} className
 * @param {string} text
 */
export function setTextById(id, text = '') {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function onLoadImage(wrapper, img) {
  return new Promise((resolve, reject) => {
    const onLoad = () => {
      wrapper.classList.add('loaded');
      resolve(); // resolve once image is loaded
    };
    const onError = () => reject(new Error('Image failed to load'));

    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onError, { once: true });

    if (img.complete) {
      if (img.naturalHeight !== 0) onLoad(); // handle cached image
      else onError(); // reject once error arises
    }
  });
}