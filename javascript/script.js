document.addEventListener("DOMContentLoaded", function () {
    // Set current year
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // Returns Gregorian year
    }

    // Load image dimensions and render with inherited color placeholders
    fetch('json/data.json')
        .then(response => response.json())
        .then(imageList => {
            const grid = document.querySelector(".grid");

            imageList.forEach(image => {
                const aspectRatio = (image.height / image.width) * 100;

                const item = document.createElement("div");
                item.classList.add("grid-item");

                // Maintain aspect ratio with padding trick
                item.style.position = 'relative';
                item.style.width = '100%';
                item.style.paddingBottom = `${aspectRatio}%`;
                item.style.backgroundColor = 'lime';
                item.style.marginBottom = '10px';
                item.style.overflow = 'hidden';

                grid.appendChild(item);
            });
        });
});