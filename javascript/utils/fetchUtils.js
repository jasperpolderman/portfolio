/**
 * Generic JSON fetch helper.
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

/**
 * Converts array to ID‑based lookup map.
 * @param {Array} list
 * @param {string} key
 * @returns {Object}
 */
export function createIdMap(list, key) {
  return Object.fromEntries(list.map(item => [item[key], item]));
}

/**
 * Fetches and returns enriched image data list or single item.
 * @param {Object} opts
 * @param {number|null} opts.imageId
 * @param {number|null} opts.seriesId
 * @param {boolean} opts.homepageOnly
 * @returns {Promise<Array|Object|null>}
 */
export async function getImageData({ imageId = null, seriesId = null, homepageOnly = false } = {}) {
  const [images, exifList, cameraList, lensList, seriesList, visibilityList] = await Promise.all([
    fetchJson('json/images.json'),
    fetchJson('json/exif.json'),
    fetchJson('json/camera.json'),
    fetchJson('json/lens.json'),
    fetchJson('json/series.json'),
    fetchJson('json/visibility.json')
  ]);

  const cameraMap = createIdMap(cameraList, 'camera_id');
  const lensMap = createIdMap(lensList, 'lens_id');
  const seriesMap = createIdMap(seriesList, 'series_id');
  const visibilityMap = createIdMap(visibilityList, 'image_id');
  const exifMap = createIdMap(exifList, 'image_id');

  let result = images;
  if (imageId != null) result = result.filter(img => img.image_id === imageId);
  if (seriesId != null) result = result.filter(img => img.series_id === seriesId);
  if (homepageOnly) result = result.filter(img => visibilityMap[img.image_id]?.is_visible_homepage);

  const enriched = result.map(img => {
    const exif = exifMap[img.image_id] || {};
    const vis = visibilityMap[img.image_id] || {};
    let focal = exif.focallength != null ? `${exif.focallength}mm` : null;
    if (focal && img.format_id === 1) focal += ` (${(exif.focallength * 1.6).toFixed(1)}mm)`;

    return {
      image_id: img.image_id,
      src: img.src,
      title: img.title,
      date: img.date,
      location: img.location,
      dimensions: { width: img.width, height: img.height },
      alt: img.alt || '',
      thumbnail: img.thumbnail,
      series: seriesMap[img.series_id]?.series_name || null,
      exif: {
        camera: cameraMap[exif.camera_id]?.camera_name || '',
        lens: lensMap[exif.lens_id]?.lens_name || '',
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

  return imageId != null ? (enriched[0] || null) : enriched;
}

/**
 * Fetches list of series metadata (id, name, description).
 * @returns {Promise<Array>}
 */
export async function getSeriesList() {
  const data = await fetchJson('json/series.json');
  return data.filter(s => s.series_id > 0);
}

/**
 * Tests connection speed by timing a single image load.
 * @param {string} testImageUrl
 * @returns {Promise<boolean>} true if connection is slow
 */
export async function isSlowConnection(testImageUrl) {
  const start = performance.now();
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(performance.now() - start > 100);
    img.onerror = () => resolve(true);
    img.src = `${testImageUrl}?cb=${Date.now()}`;
  });
}