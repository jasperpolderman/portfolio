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

            // Lazy load actual images into placeholders
            const loadImages = () => {
                const items = document.querySelectorAll(".grid-item");
                items.forEach((item, i) => {
                    const image = imageList[i];

                    // Create blur-load container
                    const blurLoad = document.createElement("div");
                    blurLoad.classList.add("blur-load");

                    // Set placeholder background image
                    blurLoad.style.backgroundImage = `url(${image.placeholder})`;
                    
                    // Placeholder animation
                    const blurDivs = document.querySelectorAll(".blur-load");
                    blurDivs.forEach(div => {
                        const blurImg = div.querySelector("img");

                        function loaded() {
                            div.classList.add("loaded");
                        }
                        if (blurImg.complete) {
                            loaded()
                        } else {
                            blurImg.addEventListener("load", loaded)
                        }
                    });

                    // Create the image element
                    const img = document.createElement("img");
                    img.src = image.src;
                    img.alt = image.alt || '';
                    img.loading = 'lazy'; // Use native lazy-loading
                    img.decoding = 'async'; // Async decoding to improve performance

                    blurLoad.appendChild(img);
                    item.appendChild(blurLoad);
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