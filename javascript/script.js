document.addEventListener("DOMContentLoaded", function () {
    // Set current year
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // Returns Gregorian year
    }

    fetch('json/data.json')
        .then(response => response.json())
        .then(imageList => {
            const grid = document.querySelector(".grid");

            // Step 1: Preload all images and get dimensions
            const preloadPromises = imageList.map(image => {
                return new Promise(resolve => {
                    const preloadImg = new Image();
                    preloadImg.src = image.src;

                    preloadImg.onload = function () {
                        resolve({
                            ...image,
                            width: preloadImg.naturalWidth,
                            height: preloadImg.naturalHeight
                        });
                    };
                });
            });

            // Step 2: After all image are preloaded
            Promise.all(preloadPromises).then(loadedImages => {
                loadedImages.forEach(img => {
                    const item = document.createElement("div");
                    item.classList.add("grid-item");

                    item.innerHTML = `
                        <img src="${img.src}" alt="${img.alt}" width="${img.width}" height="${img.height}" loading="lazy">
                    `;
                    grid.appendChild(item);
                });
            });
        });
});