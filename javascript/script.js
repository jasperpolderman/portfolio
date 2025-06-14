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
    } catch (error) {
        console.error("Error during portfolio setup:", error);
    }
});

/** --- Set footer copyright ---
 * Inserts current year into #currentYear span
 */
function setCurrentYear() {
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
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

        imageList.forEach(image => {
            const aspectRatio = (image.height / image.width) * 100;

            const item = document.createElement("div");
            item.classList.add("grid-item");
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
                let wrapper = item.querySelector(".blur-load");

                // If no placeholder was used, add wrapper now
                if (!wrapper) {
                    wrapper = document.createElement("div");
                    wrapper.classList.add("blur-load");
                    item.appendChild(wrapper);
                }

                const img = createImageElement(image.src, image.alt);

                // --- Overlay creation ---
                const overlay = document.createElement("div");
                overlay.classList.add("grid-overlay");

                const title = document.createElement("p");
                title.classList.add("grid-title");
                title.textContent = "Loading..."; // Set default title

                const date = document.createElement("p");
                date.classList.add("grid-date");
                date.textContent = ""; // Set default date

                overlay.appendChild(title);
                overlay.appendChild(date);
                wrapper.appendChild(overlay);

                img.addEventListener("load", () => {
                    wrapper.classList.add("loaded");

                    // Update with real content once loaded
                    title.textContent = image.title || '';
                    date.textContent = image.date || '';
                });

                img.addEventListener("error", () => {
                    console.error(`Failed to load image: ${image.src}`);
                    title.textContent = "Image failed to load";
                    date.textContent = "";
                });

                wrapper.appendChild(img);
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