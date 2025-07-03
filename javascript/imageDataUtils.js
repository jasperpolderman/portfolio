/**
 * Fetches and enriches image data from JSON files.
 * @param {Object} options
 * @param {number|null} options.imageId - Specific image ID to fetch (or null for all).
 * @param {number|null} options.seriesId - Specific series ID to fetch images for
 * @param {boolean} options.homepageOnly - Whether to filter for homepage visibility.
 * @returns {Promise<Array|Object|null>}
 */
export async function fetchImageData({ imageId = null, seriesId = null, homepageOnly = false } = {}) {
  const [
    images,
    exifList,
    cameraList,
    lensList,
    seriesList,
    visibilityList
  ] = await Promise.all([
    fetch('json/images.json').then(r => r.json()),
    fetch('json/exif.json').then(r => r.json()),
    fetch('json/camera.json').then(r => r.json()),
    fetch('json/lens.json').then(r => r.json()),
    fetch('json/series.json').then(r => r.json()),
    fetch('json/visibility.json').then(r => r.json()),
  ]);

  // Create quick-lookup maps
  const cameraMap = createIdMap(cameraList, 'camera_id', 'camera_name');
  const lensMap = createIdMap(lensList, 'lens_id', 'lens_name');
  const seriesMap = createIdMap(seriesList, 'series_id', 'series_name');
  const visibilityMap = createIdMap(visibilityList, 'image_id');
  const exifMap = createIdMap(exifList, 'image_id');

  let filtered = imageId != null
    ? images.filter(img => img.image_id === imageId)
    : images;

  if (seriesId != null) {
    filtered = filtered.filter(img => img.series_id === seriesId);
  }

  if (homepageOnly) {
    filtered = filtered.filter(img => visibilityMap[img.image_id]?.is_visible_homepage);
  }

  const result = filtered.map(img => {
    const exif = exifMap[img.image_id] || {};
    const vis = visibilityMap[img.image_id] || {};

    let focal = null;
    if (exif.focallength != null) {
      focal = `${exif.focallength}mm`;
      if (img.format_id === 1) {
        const crop = (exif.focallength * 1.6).toFixed(1);
        focal += ` (${crop}mm)`;
      }
    }

    return {
      image_id: img.image_id,
      src: img.src,
      title: img.title,
      date: img.date,
      location: img.location,
      dimensions: {
        width: img.width,
        height: img.height
      },
      alt: img.alt,
      thumbnail: img.thumbnail,
      series: seriesMap[img.series_id] || null,
      exif: {
        camera: cameraMap[exif.camera_id] || null,
        lens: lensMap[exif.lens_id] || null,
        focal,
        aperture: exif.aperture ? `f/${exif.aperture}` : null,
        shutter: exif.shutter ? `${exif.shutter}s` : null,
        iso: exif.iso || null
      },
      visibility: {
        homepage: !!vis.is_visible_homepage,
        series: !!vis.is_visible_series
      }
    };
  });
  
  return imageId != null ? (result[0] || null) : result;
}

/**
 * @param {string} url
 * @returns {Promise<Object|Array>}
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.json();
}

/**
 * Turns an array of objects into a map based on a key.
 * Optionally supports mapping to a specific value field.
 * @param {Array} list
 * @param {string} key - Key to use as map key
 * @returns {Object}
 */
function createIdMap(list, key, valueKey) {
  if (!Array.isArray(list)) {
    console.error('createIdMap error: list is not an array', list);
    return {};
  }

  return Object.fromEntries(list.map(item => [item[key], item]));
}

/**
 * Fetches all series objects from JSON.
 * @returns {Promise<Array>}
 */
export async function fetchSeriesId() {
  return await fetchJson('json/series.json');
}

/**
 * Determines whether a connection is "slow" by timing a single image load.
 * @param {string} testUrl - URL to sample image
 * @returns {Promise<boolean>} - True if connection is slow
 */
export async function testConnectionSpeed(testUrl) {
  const start = performance.now();
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(performance.now() - start > 100);
    img.onerror = () => resolve(true);
    img.src = `${testUrl}?cb=${Date.now()}`;
  });
}