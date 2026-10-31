
// ==========================================
// PIXELFIND - IMAGE SEARCH ENGINE
// Unsplash API + Cloudflare Worker
// ==========================================

const API_URL =
    "https://odd-wood-1cd5pixelfind-api.n3016631.workers.dev";

// HTML Elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const imageGallery = document.getElementById("imageGallery");
const galleryTitle = document.getElementById("galleryTitle");
const resultCount = document.getElementById("resultCount");
const statusMessage = document.getElementById("statusMessage");
const loadMoreButton = document.getElementById("loadMoreButton");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalCaption = document.getElementById("modalCaption");
const closeModal = document.getElementById("closeModal");

// Application state
let currentQuery = "";
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let debounceTimer = null;
let searchController = null;
let requestNumber = 0;

// ==========================================
// DEBOUNCED AUTOMATIC SEARCH
// ==========================================

searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);

    const query = searchInput.value.trim();

    if (query.length < 2) {
        return;
    }

    debounceTimer = setTimeout(() => {
        searchPhotos(query);
    }, 600);
});

// Search form
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    clearTimeout(debounceTimer);

    const query = searchInput.value.trim();

    if (query.length < 2) {
        statusMessage.hidden = false;
        statusMessage.textContent =
            "Please enter at least 2 characters.";
        return;
    }

    searchPhotos(query);
});

// ==========================================
// SEARCH PHOTOS
// ==========================================

async function searchPhotos(query, page = 1) {

    if (page === 1) {

        if (searchController) {
            searchController.abort();
        }

        searchController = new AbortController();

        currentQuery = query;
        currentPage = 1;

        imageGallery.innerHTML = "";
        loadMoreButton.hidden = true;

        galleryTitle.textContent = `Results for "${query}"`;

    } else {

        if (isLoading) return;
    }

    const thisRequest = ++requestNumber;
    const controller = searchController;

    isLoading = true;

    statusMessage.hidden = false;
    statusMessage.textContent = "Finding beautiful photos...";

    searchButton.disabled = true;
    loadMoreButton.disabled = true;

    try {

        const apiUrl = new URL(`${API_URL}/search`);

        apiUrl.searchParams.set("query", query);
        apiUrl.searchParams.set("page", page);
        apiUrl.searchParams.set("per_page", 12);

        const response = await fetch(apiUrl, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error("Unable to fetch images.");
        }

        const data = await response.json();

        if (thisRequest !== requestNumber) return;

        if (!data.results || data.results.length === 0) {

            if (page === 1) {
                statusMessage.textContent =
                    "No photos found. Try another search.";

                resultCount.textContent = "0 photos";
            }

            loadMoreButton.hidden = true;
            return;
        }

        displayImages(data.results);

        totalPages = data.total_pages;
        currentPage = page;

        resultCount.textContent =
            `${data.total.toLocaleString()} photos found`;

        statusMessage.hidden = true;

        loadMoreButton.hidden =
            currentPage >= totalPages;

    } catch (error) {

        if (error.name === "AbortError") return;

        console.error("Search error:", error);

        if (thisRequest === requestNumber) {
            statusMessage.hidden = false;
            statusMessage.textContent =
                "Something went wrong. Please try again.";
        }

    } finally {

        if (thisRequest === requestNumber) {
            isLoading = false;
            searchButton.disabled = false;
            loadMoreButton.disabled = false;
        }
    }
}

// ==========================================
// DISPLAY IMAGES
// ==========================================

function displayImages(photos) {

    photos.forEach(photo => {

        const card = document.createElement("article");
        card.className = "image-card";

        const image = document.createElement("img");

        image.src = photo.urls.small;

        image.alt =
            photo.alt_description ||
            photo.description ||
            "Unsplash photo";

        image.loading = "lazy";

        const overlay = document.createElement("div");
        overlay.className = "image-overlay";

        const photographer = document.createElement("p");

        photographer.textContent =
            `Photo by ${photo.user.name}`;

        const credit = document.createElement("a");

        credit.href =
            `${photo.user.links.html}?utm_source=pixelfind&utm_medium=referral`;

        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
        credit.textContent = "View photographer";

        credit.style.color = "#a6ed69";
        credit.style.fontSize = "12px";
        credit.style.display = "inline-block";
        credit.style.marginTop = "7px";

        overlay.appendChild(photographer);
        overlay.appendChild(credit);

        card.appendChild(image);
        card.appendChild(overlay);

        card.addEventListener("click", () => {
            openImageModal(photo);
        });

        imageGallery.appendChild(card);
    });
}

// ==========================================
// IMAGE PREVIEW MODAL
// ==========================================

function openImageModal(photo) {

    modalImage.src = photo.urls.regular;

    modalImage.alt =
        photo.alt_description || "Large photo preview";

    modalCaption.innerHTML = "";

    // Download button
    const downloadButton = document.createElement("button");

    downloadButton.type = "button";
    downloadButton.textContent = "⬇ Download Image";

    downloadButton.style.display = "block";
    downloadButton.style.width = "100%";
    downloadButton.style.maxWidth = "240px";
    downloadButton.style.margin = "0 auto 18px";
    downloadButton.style.padding = "14px 22px";
    downloadButton.style.border = "none";
    downloadButton.style.borderRadius = "10px";
    downloadButton.style.background = "#a6ed69";
    downloadButton.style.color = "#11150d";
    downloadButton.style.fontSize = "15px";
    downloadButton.style.fontWeight = "700";
    downloadButton.style.cursor = "pointer";
    downloadButton.style.boxShadow =
        "0 4px 15px rgba(166, 237, 105, 0.25)";

    downloadButton.addEventListener("click", () => {
        downloadPhoto(photo, downloadButton);
    });

    // Description
    const description = document.createElement("p");

    description.textContent =
        photo.alt_description ||
        photo.description ||
        "Beautiful photography";

    // Photographer credit
    const credit = document.createElement("p");

    credit.appendChild(
        document.createTextNode("Photo by ")
    );

    const photographerLink = document.createElement("a");

    photographerLink.href =
        `${photo.user.links.html}?utm_source=pixelfind&utm_medium=referral`;

    photographerLink.target = "_blank";
    photographerLink.rel = "noopener noreferrer";
    photographerLink.textContent = photo.user.name;
    photographerLink.style.color = "#a6ed69";

    credit.appendChild(photographerLink);
    credit.appendChild(document.createTextNode(" on "));

    const unsplashLink = document.createElement("a");

    unsplashLink.href =
        "https://unsplash.com/?utm_source=pixelfind&utm_medium=referral";

    unsplashLink.target = "_blank";
    unsplashLink.rel = "noopener noreferrer";
    unsplashLink.textContent = "Unsplash";
    unsplashLink.style.color = "#a6ed69";

    credit.appendChild(unsplashLink);

    // Original photo link
    const viewLink = document.createElement("a");

    viewLink.href = photo.links.html;
    viewLink.target = "_blank";
    viewLink.rel = "noopener noreferrer";

    viewLink.textContent =
        "View original photo on Unsplash";

    viewLink.style.color = "#a6ed69";
    viewLink.style.display = "block";
    viewLink.style.marginTop = "10px";

    modalCaption.appendChild(downloadButton);
    modalCaption.appendChild(description);
    modalCaption.appendChild(credit);
    modalCaption.appendChild(viewLink);

    imageModal.hidden = false;
    document.body.style.overflow = "hidden";
}

// ==========================================
// DOWNLOAD IMAGE HELPER
// ==========================================

async function downloadImageFile(imageUrl, filename) {

    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error("Unable to fetch image file.");
    }

    const imageBlob = await response.blob();

    if (!imageBlob.size) {
        throw new Error("Downloaded image is empty.");
    }

    const objectURL = URL.createObjectURL(imageBlob);

    const downloadLink = document.createElement("a");

    downloadLink.href = objectURL;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    // Give the browser time to start the download
    setTimeout(() => {
        URL.revokeObjectURL(objectURL);
    }, 10000);
}

// ==========================================
// UNSPLASH DOWNLOAD TRACKING + DOWNLOAD
// ==========================================

async function downloadPhoto(photo, button) {

    if (!photo.links.download_location) {
        alert("Download link is not available for this photo.");
        return;
    }

    button.disabled = true;
    button.textContent = "Preparing download...";

    try {

        // Step 1: Call Unsplash download tracking endpoint
        const trackingUrl = new URL(`${API_URL}/download`);

        trackingUrl.searchParams.set(
            "url",
            photo.links.download_location
        );

        const trackingResponse = await fetch(trackingUrl);

        if (!trackingResponse.ok) {
            throw new Error("Download tracking failed.");
        }

        const trackingData = await trackingResponse.json();

        // Step 2: Prepare filename
        const photoId = photo.id || "photo";
        const filename = `PixelFind-${photoId}.jpg`;

        // Step 3: Download the tracked URL
        try {

            if (!trackingData.url) {
                throw new Error("Tracking URL not returned.");
            }

            await downloadImageFile(
                trackingData.url,
                filename
            );

        } catch (firstError) {

            console.warn(
                "Tracked URL download failed. Trying original image URL.",
                firstError
            );

            // Step 4: Fallback to Unsplash image URL
            await downloadImageFile(
                photo.urls.full || photo.urls.regular,
                filename
            );
        }

        button.textContent = "✓ Download Started";

    } catch (error) {

        console.error("Download error:", error);

        button.textContent = "Try Download Again";

        alert(
            "Unable to download this image. Please try again."
        );

    } finally {

        button.disabled = false;
    }
}

// ==========================================
// CLOSE MODAL
// ==========================================

function closeImageModal() {

    imageModal.hidden = true;
    modalImage.src = "";
    modalCaption.innerHTML = "";

    document.body.style.overflow = "";
}

closeModal.addEventListener("click", closeImageModal);

imageModal.addEventListener("click", function (event) {

    if (event.target === imageModal) {
        closeImageModal();
    }
});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && !imageModal.hidden) {
        closeImageModal();
    }
});

// ==========================================
// LOAD MORE IMAGES
// ==========================================

loadMoreButton.addEventListener("click", function () {

    if (currentPage < totalPages && !isLoading) {
        searchPhotos(currentQuery, currentPage + 1);
    }
});

// ==========================================
// POPULAR SEARCH SUGGESTIONS
// ==========================================

document.querySelectorAll(".suggestion").forEach(button => {

    button.addEventListener("click", function () {

        clearTimeout(debounceTimer);

        const query = this.dataset.query;

        searchInput.value = query;

        searchPhotos(query);
    });
});

// ==========================================
// INITIAL MESSAGE
// ==========================================

console.log("PixelFind Image Search Engine is ready!");
