# Jasper Polderman’s Photography Portfolio 📸

Welcome to my photography portfolio! This project is a modern, responsive web showcase for my favorite travel and landscape photos, organized by individual images and thematic series.

---

## 🌍 About the Project

This portfolio is built to be a minimalist, fast, and scalable platform for displaying photography. All content—including photo metadata, EXIF details, and series information—is loaded from JSON files, making it easy to update or expand.

- **Homepage:** Highlights a curated selection of photos.
- **Series:** Browse themed collections of images.
- **Series View:** Dive into a series to explore all its photos, complete with image metadata and EXIF details.

---

## 🖼 Features

- **Responsive Design:** Seamlessly adapts from mobile to desktop.
- **Dynamic Grids:** JavaScript builds photo grids and series cards from JSON data.
- **Lazy Loading:** Images are loaded as you scroll for faster performance.
- **Lightbox Viewer:** Click any image to view it in a fullscreen modal with navigation and detailed metadata.
- **EXIF Display:** Camera, lens, settings, and location info for each image.
- **Sticky Sidebar:** Profile, navigation, and copyright info remain accessible.
- **Modern JS Modules:** Modular code structure for maintainability.
- **Accessible HTML:** Semantic markup and ARIA labels for better accessibility.

---

## 🧑‍💻 Tech Stack

- HTML5
- CSS3 (custom properties, media queries, modern layout)
- Vanilla JavaScript (ES Modules)
- JSON for all photo, EXIF, and series data

---

## 🚀 Project Structure

```
/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── lightbox.html
├── css/
│   └── style.css
├── images/
│   ├── fullsize/
│   └── placeholders/
├── javascript/
│   ├── main.js
│   ├── pages/
│   └── utils/
├── json/
│   └── *.json
├── index.html
├── series.html
├── series-view.html
└── README.md
```

---

## 📦 How It Works

- All image and series data is stored in `/json/`.
- The JavaScript reads these files and dynamically renders the homepage, series listing, and series view.
- Clicking an image opens a lightbox modal with navigation and EXIF info.

---

## ✍️ Customization

To add or update photos:

1. Add your full-size image and placeholder thumbnail to `/images/fullsize/` and `/images/placeholders/`.
2. Update `images.json` with the new photo’s metadata.
3. Update `exif.json`, `camera.json`, or `lens.json` as needed.
4. To add to a series, assign a `series_id` matching one in `series.json`.

---

## 📝 Credits

Created and maintained by **Jasper Polderman**.  
© 2024-present Jasper Polderman. All rights reserved.

---

## 📣 License

This portfolio is for personal, non-commercial use.  
All images are copyright and may not be used without permission.