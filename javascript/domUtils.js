/**
 * Creates an optimized <img> element (lazy-load + async decode).
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
 * Populates all elements with id="currentYear" with the current year.
 */
export function populateCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('#currentYear')
    .forEach(el => { el.textContent = year });
}

/**
 * Adds a `.loaded` class to the profile image wrapper div once it loads.
 * @param {string} selector - CSS selector for the image
 * @param {string} wrapperClass - Class used to add the "loaded" state
 */
export function applyLoadedClassToProfileImage(selector = '.profile-picture', wrapperClass = 'blur-load') {
  const img = document.querySelector(selector);
  if (!img) return;

  const wrapper = img.closest(`.${wrapperClass}`);
  const mark = () => wrapper?.classList.add('loaded');
  img.addEventListener('load', mark);
  if (img.complete && img.naturalWidth) mark();
}