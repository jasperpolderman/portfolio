document.addEventListener("DOMContentLoaded", async function () {
    setCurrentYear();
    handleStaticImages();

    try {
        const imageList = await fetchImageList('json/data.json');

        const usePlaceholders = await shouldUsePlaceholders(imageList[0].src);

        await createLayout(imageList);

        if (usePlaceholders) {
            await applyPlaceholders(imageList);
        }

        await loadHighResImages(imageList);
    } catch (error) {
        console.error("Error during portfolio setup: ", error);
    }
});

// --- Utility to set the current year ---
function setCurrentYear() {
    const yearSpan = document.getElementById("currentYear");

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// --- Fetch image metadata ---
async function fetchImageList(url) {
    const response = await fetch(url);
    return await response.json();
}

// --- Check if we should use placeholders based on image load speed ---
async function shouldUsePlaceholders(sampleUrl) {
    const start = performance.now();

    try {
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = sampleUrl + "?cacheBust=" + Date.now(); // Avoid cached result
        });

        const duration = performance.now() - start;
        return duration > 100; // Use placeholder only if load takes more than 100ms
    } catch {
        return true; // On error, fallback to using placeholders
    }
}

// --- Step 1: Create layout based on image aspect ratios ---
function createLayout(imageList) {
    return new Promise((resolve) => {
        const grid = document.querySelector(".grid");

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

// --- Step 2: Apply blurred placeholders as background images ---
function applyPlaceholders(imageList) {
    return new Promise((resolve) => {
        const items = document.querySelectorAll(".grid-item");

        items.forEach((item, i) => {
            const image = imageList[i];

            const blurLoad = document.createElement("div");
            blurLoad.classList.add("blur-load");
            blurLoad.style.backgroundImage = `url(${image.placeholder})`;

            item.appendChild(blurLoad);
        });

        resolve();
    });
}

// --- Step 3: Load high-resolution images and insert them ---
function loadHighResImages(imageList) {
    return new Promise((resolve) => {
        const items = document.querySelectorAll(".grid-item");

        const insertImages = () => {
            items.forEach((item, i) => {
                const image = imageList[i];

                let blurLoad = item.querySelector(".blur-load");

                // If blur-load wrapper is not present, create one
                if (!blurLoad) {
                    blurLoad = document.createElement("div");
                    blurLoad.classList.add("blur-load");
                    item.appendChild(blurLoad);
                }

                const img = document.createElement("img");

                img.addEventListener("load", () => {
                    blurLoad.classList.add("loaded");
                });

                img.addEventListener("error", () => {
                    console.error(`Image failed to load: ${image.src}`);
                });

                img.src = image.src;
                img.alt = image.alt || '';
                img.loading = 'lazy';
                img.decoding = 'async';

                blurLoad.appendChild(img);
            });

            resolve();
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(insertImages);
        } else {
            setTimeout(insertImages, 200);
        }
    });
}

// --- Handle static images blur-load effect ---
function handleStaticImages() {
    const profileImg = document.querySelector(".profile-picture");

    if (profileImg) {
        const blurWrapper = profileImg.closest(".blur-load");

        profileImg.addEventListener("load", () => {
            blurWrapper?.classList.add("loaded");
        });

        // Fallback if already cached
        if (profileImg.complete && profileImg.naturalWidth !== 0) {
            blurWrapper?.classList.add("loaded");
        }
    }
}