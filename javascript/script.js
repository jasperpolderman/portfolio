// Global state for currently shown image in lightbox
let currentLightboxIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
    setCurrentYear();
    handleStaticProfileImage();

    try {
        const imageList = await loadImageMetadata('json/data.json');

        const shouldUsePlaceholder = await isSlowConnection(imageList[0].src);

        await renderGridLayout(imageList);

        if (shouldUsePlaceholder) {
            await renderBlurPlaceholders(imageList);
        }

        await loadFullResolutionImages(imageList);

        await loadLightbox();
        setLightbox(imageList);
    } catch (error) {
        console.error("Error during portfolio setup:", error);
    }
});

/** --- Load lightbox HTML fragment ---
 * Fetches the lightbox markup from a file and inserts it into the DOM
 * @returns {Promise<void>}
 * @throws Will throw an error if fetching the lightbox HTML fails
 */
async function loadLightbox() {
    const response = await fetch('assets/lightbox.html');
    if (!response.ok) throw new Error('Failed to load lightbox HTML');
    const html = await response.text();
    document.getElementById('lightbox-container').innerHTML = html;
}

/** --- Initialize lightbox functionality ---
 * Sets up event listeners for grid items to open the lightbox and handles lightbox close behavior.
 * Requires the lightbox HTML to be already present in the DOM.
 */
function setLightbox(imageList) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImageId = document.getElementById("lightbox-image");
    const lightboxImageBackground = document.getElementById("lightbox-image-background");
    
    if (!lightbox || !lightboxImageId || !lightboxImageBackground) return // Safety check

    document.querySelectorAll(".grid-item").forEach(item => {
        item.addEventListener("click", e => {
            lightbox.classList.add("active")
            document.body.style.overflow = "hidden";

            const index = item.getAttribute("data-index");
            if (index === null) return;

            currentLightboxIndex = Number(index);
            const image = imageList[currentLightboxIndex];
            if (!image) return;

            const lightboxImage = item.querySelector("img");
            if (!lightboxImage) return;

            const img = document.createElement("img");
            img.src = lightboxImage.src;

            while (lightboxImageId.firstChild) {
                lightboxImageId.removeChild(lightboxImageId.firstChild);
            }
            lightboxImageId.appendChild(img);
            lightboxImageBackground.style.setProperty('--lightbox-bg', `url('images/placeholders/${image.placeholder.split('/').pop()}')`);

            setExifInfo(image);
            setCurrentYear();
        });
    });

    lightbox.addEventListener("click", e => {
        if (e.target !== e.currentTarget) return
        lightbox.classList.remove("active")
        document.body.style.overflow = "";
    });

    const closeBtn = document.getElementById("lightbox-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeLightbox);
    }

    const nextBtn = document.getElementById("lightbox-next");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => showNextImage(imageList));
    }

    const prevBtn = document.getElementById("lightbox-prev");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => showPreviousImage(imageList));
    }
}

/** --- Set EXIF Information ---
 * Populates DOM elements with EXIF metadata and related image information
 * @param {Object} image - The image object containing EXIF and metadata
 * @param {Object} image.exif - The EXIF metadata object
 * @param {string} [image.title] - The image title
 * @param {string} [image.exif.camera] - The camera model used
 * @param {string} [image.exif.lens] - The lens model used
 * @param {string} [image.exif.focallength] - The focal length
 * @param {string} [image.exif.aperture] - The aperture value
 * @param {string} [image.exif.shutter] - The shutter speed
 * @param {string|number} [image.exif.ISO] - The ISO setting
 * @param {string} [image.location] - The location where the photo was taken
 * @param {string} [image.date] - The date the photo was taken
 * @returns {void}
 */
function setExifInfo(image) {
    const title = document.getElementById("title");
    const camera = document.getElementById("camera");
    const lens = document.getElementById("lens");
    const settings = document.getElementById("settings");
    const location = document.getElementById("location");
    const date = document.getElementById("date");

    if (!image || !image.exif) return;

    if (title) title.textContent = image.title || '';
    if (camera) camera.textContent = image.exif.camera || '';
    if (lens) lens.textContent = image.exif.lens || '';
    if (settings) {
        const parts = [
            image.exif.focallength,
            image.exif.aperture,
            image.exif.shutter,
            image.exif.ISO ? `ISO ${image.exif.ISO}` : null
        ].filter(Boolean);
        settings.innerHTML = parts.map(part => `<span class="setting-part">${part}</span>`).join('<span class="dot"> • </span>');
    }
    if (location) location.textContent = image.location || '';
    if (date) date.textContent = image.date || '';
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

function showNextImage(imageList) {
    if (!Array.isArray(imageList) || imageList.length === 0) return;

    currentLightboxIndex = (currentLightboxIndex + 1) % imageList.length; // Wrap around
    const image = imageList[currentLightboxIndex];

    const lightboxImageId = document.getElementById("lightbox-image");
    const lightboxImageBackground = document.getElementById("lightbox-image-background");

    if (!lightboxImageId || !lightboxImageBackground) return;

    // Create and insert new image
    const img = document.createElement("img");
    img.src = image.src;

    while (lightboxImageId.firstChild) {
        lightboxImageId.removeChild(lightboxImageId.firstChild);
    }
    lightboxImageId.appendChild(img);

    lightboxImageBackground.style.setProperty('--lightbox-bg', `url('../images/placeholders/${image.placeholder.split('/').pop()}')`);

    setExifInfo(image);
    setCurrentYear();
}

function showPreviousImage(imageList) {
    if (!Array.isArray(imageList) || imageList.length === 0) return;

    // Decrement index and wrap around
    currentLightboxIndex = (currentLightboxIndex - 1 + imageList.length) % imageList.length;
    const image = imageList[currentLightboxIndex];

    const lightboxImageId = document.getElementById("lightbox-image");
    const lightboxImageBackground = document.getElementById("lightbox-image-background");

    if (!lightboxImageId || !lightboxImageBackground) return;

    const img = document.createElement("img");
    img.src = image.src;

    while (lightboxImageId.firstChild) {
        lightboxImageId.removeChild(lightboxImageId.firstChild);
    }
    lightboxImageId.appendChild(img);

    lightboxImageBackground.style.setProperty('--lightbox-bg', `url('images/placeholders/${image.placeholder.split('/').pop()}')`);

    setExifInfo(image);
    setCurrentYear();
}

/** --- Set footer copyright ---
 * Inserts current year into #currentYear span
 */
function setCurrentYear() {
    const spans = document.querySelectorAll("#currentYear");
    const year = new Date().getFullYear();
    spans.forEach(span => span.textContent = year);
}

/** --- Load image metadata from JSON file ---
 * @param {string} url - URL to the JSON file
 * @returns {Promise<Array>}
 */
async function loadImageMetadata(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image data from ${url}`);
    return response.json();
}

/** --- Determine if placeholders are necessary based on connection speed ---
 * Measures time to load one image
 * @param {string} imageUrl - High-res image URL
 * @returns {Promise<boolean>}
 */
async function isSlowConnection(imageUrl) {
    const startTime = performance.now();

    try {
        await new Promise((resolve, reject) => {
            const testImage = new Image();
            testImage.onload = resolve;
            testImage.onerror = reject;
            testImage.src = `${imageUrl}?cb=${Date.now()}`; // Avoid caching
        });

        const loadTime = performance.now() - startTime;
        return loadTime > 100;
    } catch {
        return true; // Default to placeholders on error
    }
}

/** --- Create image grid based on aspect ratios ---
 * @param {Array} imageList
 */
function renderGridLayout(imageList) {
    return new Promise(resolve => {
        const grid = document.querySelector(".grid");
        if (!grid) return resolve();

        imageList.forEach((image, index) => {
            const aspectRatio = (image.height / image.width) * 100;

            const item = document.createElement("div");
            item.classList.add("grid-item");
            item.setAttribute("data-index", index);
            item.style.setProperty('--aspect-ratio', `${aspectRatio}%`);

            grid.appendChild(item);
        });

        resolve();
    });
}

/** --- Apply blurred low-res placeholder backgrounds ---
 * @param {Array} imageList
 */
function renderBlurPlaceholders(imageList) {
    return new Promise(resolve => {
        const gridItems = document.querySelectorAll(".grid-item");

        gridItems.forEach((item, index) => {
            const image = imageList[index];
            const placeholder = document.createElement("div");

            placeholder.classList.add("blur-load");
            placeholder.style.backgroundImage = `url(${image.placeholder})`;

            item.appendChild(placeholder);
        });

        resolve();
    });
}

/** --- Load full-resolution images and append to DOM ---
 * @param {Array} imageList
 */
function loadFullResolutionImages(imageList) {
    return new Promise(resolve => {
        const gridItems = document.querySelectorAll(".grid-item");

        const insertImages = () => {
            gridItems.forEach((item, index) => {
                const image = imageList[index];

                // --- Ensure wrapper (.blur-load) exists ---
                let wrapper = item.querySelector(".blur-load");
                if (!wrapper) {
                    wrapper = document.createElement("div");
                    wrapper.classList.add("blur-load");
                }

                // --- Create image element ---
                const img = createImageElement(image.src, image.alt);

                // --- Create title and date elements ---
                const title = document.createElement("p");
                title.classList.add("grid-title");
                title.textContent = "Loading...";

                const date = document.createElement("p");
                date.classList.add("grid-date");
                date.textContent = "";

                // --- Create overlay (.grid-overlay) ---
                const overlay = document.createElement("div");
                overlay.classList.add("grid-overlay");

                // --- Create overlay (.content-overlay) ---
                const content = document.createElement("div");
                content.classList.add("content-overlay");

                // Child of .grid-overlay
                overlay.appendChild(content);

                // --- Create overlay (.hover-overlay-x) ---
                const hover1 = document.createElement("div");
                hover1.classList.add("hover-overlay-1");
                const hover2 = document.createElement("div");
                hover2.classList.add("hover-overlay-2");
                const hover3 = document.createElement("div");
                hover3.classList.add("hover-overlay-3");
                const hover4 = document.createElement("div");
                hover4.classList.add("hover-overlay-4");

                // Child of .content-overlay
                content.appendChild(hover1);
                content.appendChild(hover2);
                content.appendChild(hover3);
                content.appendChild(hover4);

                // Children of .content-overlay
                content.appendChild(title);
                content.appendChild(date);

                // --- Append everything to wrapper in correct order ---
                wrapper.appendChild(img);       // .blur-load > img
                wrapper.appendChild(overlay);   // .blur-load > .grid-overlay

                // --- Append wrapper to grid item if newly created ---
                if (!item.contains(wrapper)) {
                    item.appendChild(wrapper);  // .grid-item > .blur-load
                }

                // --- Image load events ---
                img.addEventListener("load", () => {
                    wrapper.classList.add("loaded");
                    title.textContent = image.title || '';
                    date.textContent = image.date || '';
                });

                img.addEventListener("error", () => {
                    console.error(`Failed to load image: ${image.src}`);
                    title.textContent = "Image failed to load";
                    date.textContent = "";
                });
            });

            resolve();
        };

        if ("requestIdleCallback" in window) {
            requestIdleCallback(insertImages);
        } else {
            setTimeout(insertImages, 200);
        }
    });
}

/** --- Create a standard image element with best practices ---
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @returns {HTMLImageElement}
 */
function createImageElement(src, alt = '') {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';

    return img;
}

/** --- Handle blur transition for static profile image ---
 * For example, the profile picture in the sidebar
 */
function handleStaticProfileImage() {
    const profileImg = document.querySelector(".profile-picture");

    if (!profileImg) return;

    const wrapper = profileImg.closest(".blur-load");

    const markLoaded = () => wrapper?.classList.add("loaded");

    profileImg.addEventListener("load", markLoaded);

    // If already loaded from cache
    if (profileImg.complete && profileImg.naturalWidth !== 0) {
        markLoaded();
    }
}

/* ---------- To Do ---------- */

/* Fanzy loading for lightbox images, just like done for homepage images */
/* Clean up code an make better use of functions (e.g. not using fanzy loading twice) */

/* --------------------------- */