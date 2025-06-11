/* To-Do List
- Load all images after lazy-loading images are all downloaded
*/

document.addEventListener("DOMContentLoaded", function () {
    // Set current year
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // Returns Gregorian year
    }

    // Fetch the image dimensions and create placeholders
    fetch('json/data.json')
        .then(response => response.json())
        .then(imageList => {
            const grid = document.querySelector(".grid");

            imageList.forEach(image => {
                const aspectRatio = (image.height / image.width) * 100;

                // Create a grid-item div with padding to preserve aspect ratio
                const item = document.createElement("div");
                item.classList.add("grid-item");
                item.style.setProperty('--aspect-ratio', `${aspectRatio}%`)

                // Append placeholder to the grid
                grid.appendChild(item);
            });

            // Function to append images lazily after placeholders exist
            const loadImages = () => {
                const items = document.querySelectorAll(".grid-item");
                items.forEach((item, i) => {
                    const image = imageList[i];
                    const img = document.createElement("img");
                    img.src = image.src;
                    img.alt = image.alt || '';
                    img.loading = 'lazy'; // Use native lazy-loading
                    img.decoding = 'async'; // Async decoding to improve performance

                    item.appendChild(img);
                });
            };

            // Defer image loading until browser is idle or after a short delay
            if ('requestIdleCallback' in window) {
                requestIdleCallback(loadImages);
            } else {
                setTimeout(loadImages, 200);
            }
        });
});