import { getImageData, isSlowConnection } from '../utils/fetchUtils.js';
import { createImageGrid, appendThumbnails, renderGrid } from '../utils/gridUtils.js';

/**
 * Sets up homepage gallery with optional blur placeholders.
 * @param {string} gridSelector
 */
export async function setupHomePage(gridSelector, placeholderClass = 'grid-item', blurClassName = 'blur-load') {
  const images = await getImageData({ homepageOnly: true });
  const slow = images[0] ? await isSlowConnection(images[0].src) : false;

  createImageGrid(images, gridSelector, placeholderClass);
  if (slow) appendThumbnails(images, gridSelector, `.${placeholderClass}`, blurClassName);
  await renderGrid(images, gridSelector, placeholderClass, blurClassName, true);
}