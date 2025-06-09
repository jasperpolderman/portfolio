document.addEventListener("DOMContentLoaded", function () {
    // Set current year
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // Returns Gregorian year
    }

    // Highlight active nav link based on current URL
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop(); // Gets the current file name

    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
            link.classList.add("active");
        }
    });

    // Load images from JSON and append to grid
    const grid = document.querySelector(".grid");

    fetch("json/data.json")
        .then(response => response.json())
        .then(images => {
            console.log("Images loaded:", images);

            images.forEach(img => {
                console.log("Appending image:", img.src)

                const item = document.createElement("div");
                item.classList.add("grid-item");

                item.innerHTML = `
                    <img src="${img.src}" alt="${img.alt}" loading="lazy">
                `;

                grid.appendChild(item);
            });
        })
        .catch(err => console.error("Failed to load JSON:", err));
});