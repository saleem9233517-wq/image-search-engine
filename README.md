# PixelFind — Image Search Engine

PixelFind is a modern, responsive image search engine built using HTML, CSS, and JavaScript. It uses the Unsplash API to help users discover and explore beautiful photographs.

## Features

- Search images by keywords.
- Automatic search with debounce functionality.
- Responsive image gallery.
- Image preview modal.
- Photographer attribution.
- Unsplash photo links.
- Download images with Unsplash download tracking.
- Load More functionality.
- Secure API integration using Cloudflare Workers.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Unsplash API
- Cloudflare Workers

## Project Structure

```text
image-search-engine/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Setup and Installation

1. Clone this repository:

```bash
git clone https://github.com/saleem9233517-wq/image-search-engine.git
```

2. Open the project folder.

3. Open `index.html` in your browser or use the VS Code Live Server extension.

## API Configuration

PixelFind uses the Unsplash API through a Cloudflare Worker.

The API key is stored securely as a Cloudflare Worker secret and is not included in the frontend source code.

## Acknowledgements

- [Unsplash](https://unsplash.com/) for providing photography and API access.
- [Cloudflare Workers](https://workers.cloudflare.com/) for secure API integration.

## Author

**Saleem Ullah Khan**

GitHub: [saleem9233517-wq](https://github.com/saleem9233517-wq)

## Purpose

Developed as part of the Pynexia Tech Web Development Training Program.
