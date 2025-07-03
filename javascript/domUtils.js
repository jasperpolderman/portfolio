/**
 * Creates an optimized <img> element with lazy loading and async decoding.
 * @param {string} src - Image source URL.
 * @param {string} [alt = ''] - Alternate text for image.
 * @returns {HTMLImageElement}
 */
export const createLazyImage = (src, alt = '') => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
};

/**
 * Populates all elements with class "current-year" with the current year.
 */
export const populateCurrentYear = () => {
  const year = new Date().getFullYear();
  document.querySelectorAll('.currentYear')
    .forEach(el => { el.textContent = year; });
};

/**
 * Adds a `.loaded` class to the closest wrapper element once the profile image loads.
 * @param {string} selector - CSS selector for the image.
 * @param {string} wrapperClass - Class name of the wrapper element to mark as loaded
 */
export const applyLoadedClassToProfileImage = (selector = '.profile-picture', wrapperClassName = 'blur-load') => {
  const img = document.querySelector(selector);
  if (!img) return;

  const wrapper = img.closest(`.${wrapperClassName}`);
  const markLoaded = () => wrapper?.classList.add('loaded');

  img.addEventListener('load', markLoaded);

  // If image is already loaded (from cache), mark immediately
  if (img.complete && img.naturalWidth) markLoaded();
};