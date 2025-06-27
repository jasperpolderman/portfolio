/**
 * Fetches and enriches image data from JSON files.
 * @param {Object} options
 * @param {number|null} options.imageId - Specific image ID to fetch (or null for all).
 * @param {boolean} options.homepageOnly - Whether to filter for homepage visibility.
 * @returns {Promise<Array|Object|null>}
 */
export async function fetchImageData({ imageId = null, homepageOnly = false } = {}) {
  const [
    images,
    exifList,
    cameraList,
    lensList,
    seriesList,
    visibilityList
  ] = await Promise.all([
    fetch('db_json/images.json').then(r => r.json()),
    fetch('db_json/exif.json').then(r => r.json()),
    fetch('db_json/camera.json').then(r => r.json()),
    fetch('db_json/lens.json').then(r => r.json()),
    fetch('db_json/series.json').then(r => r.json()),
    fetch('db_json/visibility.json').then(r => r.json()),
  ]);

  const cameraMap = Object.fromEntries(cameraList.map(c => [c.camera_id, c.camera_name]));
  const lensMap   = Object.fromEntries(lensList.map(l => [l.lens_id, l.lens_name]));
  const seriesMap = Object.fromEntries(seriesList.map(s => [s.series_id, s.series_name]));
  const visibleMap = Object.fromEntries(visibilityList.map(v => [v.image_id, v]));
  const exifMap   = Object.fromEntries(exifList.map(e => [e.image_id, e]));

  let filtered = imageId != null
    ? images.filter(img => img.image_id === imageId)
    : images;

  if (homepageOnly) {
    filtered = filtered.filter(img => visibleMap[img.image_id]?.is_visible_homepage);
  }

  const result = filtered.map(img => {
    const exif = exifMap[img.image_id] || {};
    const vis = visibleMap[img.image_id] || {};

    let focal = null;
    if (exif.focallength != null) {
      focal = `${exif.focallength}mm`;
      if (img.format_id === 1) {
        const crop = (exif.focallength * 1.6).toFixed(1);
        focal += ` (${crop}mm)`;
      }
    }

    return {
      imageId: img.image_id,
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
 * Determines whether a connection is "slow" by timing a single image load.
 * @param {string} testUrl
 * @returns {Promise<boolean>}
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