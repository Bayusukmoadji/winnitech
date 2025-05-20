const techCrunchApiUrl =
  "https://techcrunch.com/wp-json/wp/v2/posts?per_page=11&_embed";

let allFetchedPosts = [];
let displayedPostIds = new Set();

const carouselItemsContainer = document.getElementById("carouselItems");
const cardGridContainer = document.getElementById("cardGrid");
const searchInput = document.getElementById("searchInputTeknologi");
const noResultsMessage = document.getElementById("noResultsMessageTeknologi");
const loadMoreButton = document.getElementById("loadMoreButton");

function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const secondsPast = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (secondsPast < 60) {
    return "Just now";
  }
  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) {
    return `about ${minutesPast} minute${minutesPast === 1 ? "" : "s"} ago`;
  }
  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) {
    return `about ${hoursPast} hour${hoursPast === 1 ? "" : "s"} ago`;
  }
  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast === 1) {
    return "Yesterday";
  }
  if (daysPast < 7) {
    return `about ${daysPast} day${daysPast === 1 ? "" : "s"} ago`;
  }
  return past.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderInitialCarousel(postsForCarousel) {
  if (!carouselItemsContainer) return;
  carouselItemsContainer.innerHTML = "";
  let itemsInCarousel = 0;
  postsForCarousel.slice(0, 3).forEach((post) => {
    const imageUrl =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/900x500?text=No+Image";
    const title = post.title.rendered;
    const link = post.link;
    const timeAgo = formatTimeAgo(post.date);

    if (itemsInCarousel < 3) {
      const carouselItemAnchor = document.createElement("a");
      carouselItemAnchor.href = link;
      carouselItemAnchor.target = "_blank";
      carouselItemAnchor.className = "text-decoration-none";

      const carouselItemDiv = document.createElement("div");
      carouselItemDiv.className = `carousel-item ${
        itemsInCarousel === 0 ? "active" : ""
      } h-100 position-relative`;
      carouselItemDiv.innerHTML = `
                <img src="${imageUrl}" class="d-block w-100 h-100 object-fit-cover" alt="${title}" loading="lazy"/>
                <div class="card-img-overlay d-flex flex-column justify-content-end align-items-start p-3 gradient-overlay">
                    <h5 class="text-white mb-2 fw-semibold">${title}</h5>
                    <p class="text-white small m-0">${timeAgo}</p>
                </div>
            `;
      carouselItemAnchor.appendChild(carouselItemDiv);
      carouselItemsContainer.appendChild(carouselItemAnchor);
      itemsInCarousel++;
    }
  });
}

function renderCardGrid(postsForGrid) {
  if (!cardGridContainer) return;
  cardGridContainer.innerHTML = "";

  if (
    postsForGrid.length === 0 &&
    searchInput &&
    searchInput.value.trim() !== ""
  ) {
    if (noResultsMessage) noResultsMessage.style.display = "block";
  } else {
    if (noResultsMessage) noResultsMessage.style.display = "none";
  }

  postsForGrid.forEach((post) => {
    const imageUrl =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/500x300?text=No+Image";
    const title = post.title.rendered;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.excerpt.rendered;
    const textExcerpt = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt =
      textExcerpt.substring(0, 100) + (textExcerpt.length > 100 ? "..." : "");
    const link = post.link;
    const timeAgo = formatTimeAgo(post.date);

    const cardColumn = document.createElement("div");
    cardColumn.className = "col";
    const cardAnchor = document.createElement("a");
    cardAnchor.href = link;
    cardAnchor.target = "_blank";
    cardAnchor.className = "text-decoration-none";
    const cardDiv = document.createElement("div");
    cardDiv.className = "card h-100 bg-dark text-white rounded-4";
    cardDiv.innerHTML = `
            <img src="${imageUrl}" class="card-img-top rounded-top-4" alt="${title}" loading="lazy"/>
            <div class="card-body p-3 d-flex flex-column">
                <p class="card-text news-title fw-semibold mb-2">${title}</p>
                <p class="card-text-excerpt mb-2">${excerpt}</p>
                <p class="text-white small mt-auto mb-0 time-ago">${timeAgo}</p>
            </div>
        `;
    cardAnchor.appendChild(cardDiv);
    cardColumn.appendChild(cardAnchor);
    cardGridContainer.appendChild(cardColumn);
  });
}

function fetchInitialNews() {
  fetch(techCrunchApiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((posts) => {
      const uniquePosts = posts.filter((post) => {
        if (!displayedPostIds.has(post.id)) {
          displayedPostIds.add(post.id);
          return true;
        }
        return false;
      });
      allFetchedPosts = uniquePosts;
      renderInitialCarousel(allFetchedPosts.slice(0, 3));
      renderCardGrid(allFetchedPosts.slice(3));
    })
    .catch((error) => {
      console.error("Error fetching TechCrunch API data:", error);
      if (carouselItemsContainer)
        carouselItemsContainer.innerHTML =
          "<p class='text-danger text-center p-3'>Failed to load carousel news.</p>";
      if (cardGridContainer)
        cardGridContainer.innerHTML = `<p class="text-danger text-center p-3">Failed to load news. Please try again later.</p>`;
    });
}

if (searchInput) {
  searchInput.addEventListener("keyup", function (event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    if (searchTerm === "") {
      renderCardGrid(allFetchedPosts.slice(3));
      if (noResultsMessage) noResultsMessage.style.display = "none";
    } else {
      const filteredPosts = allFetchedPosts.filter((post) => {
        const title = post.title.rendered.toLowerCase();
        return title.includes(searchTerm);
      });
      renderCardGrid(filteredPosts);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("searchInputTeknologi")) {
    console.warn("Element with ID 'searchInputTeknologi' not found.");
  }
  if (!document.getElementById("noResultsMessageTeknologi")) {
    console.warn("Element with ID 'noResultsMessageTeknologi' not found.");
  }
  fetchInitialNews();
});

if (loadMoreButton) {
  let currentPage = 1;
  const postsPerPage = 12;

  loadMoreButton.addEventListener("click", function () {
    currentPage++;
    const nextPageApiUrl = `https://techcrunch.com/wp-json/wp/v2/posts?per_page=${postsPerPage}&page=${currentPage}&_embed`;

    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading...";

    fetch(nextPageApiUrl)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            console.warn(
              `No more posts found or invalid page number (status 400) for page ${currentPage}.`
            );
            return [];
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((newPosts) => {
        const trulyNewPosts = newPosts.filter((post) => {
          if (!displayedPostIds.has(post.id)) {
            displayedPostIds.add(post.id);
            return true;
          }
          return false;
        });

        if (trulyNewPosts.length > 0) {
          allFetchedPosts = allFetchedPosts.concat(trulyNewPosts);

          const currentSearchTerm = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";
          if (currentSearchTerm !== "") {
            const filteredPosts = allFetchedPosts.filter((post) =>
              post.title.rendered.toLowerCase().includes(currentSearchTerm)
            );
            renderCardGrid(filteredPosts);
          } else {
            appendCardGridItems(trulyNewPosts);
          }

          loadMoreButton.disabled = false;
          loadMoreButton.textContent = "Load More";
        } else {
          loadMoreButton.textContent = "No more news";
          // Pertimbangkan untuk menonaktifkan tombol secara permanen jika tidak ada berita lagi
          // loadMoreButton.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error fetching more posts:", error);
        loadMoreButton.textContent = "Failed to load";
        // Pertimbangkan untuk membiarkan tombol bisa diklik lagi atau menonaktifkannya
        // loadMoreButton.disabled = false;
      });
  });
}

function appendCardGridItems(postsToAppend) {
  if (!cardGridContainer) return;

  postsToAppend.forEach((post) => {
    const imageUrl =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://via.placeholder.com/500x300?text=No+Image";
    const title = post.title.rendered;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.excerpt.rendered;
    const textExcerpt = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt =
      textExcerpt.substring(0, 100) + (textExcerpt.length > 100 ? "..." : "");
    const link = post.link;
    const timeAgo = formatTimeAgo(post.date);

    const cardColumn = document.createElement("div");
    cardColumn.className = "col";
    const cardAnchor = document.createElement("a");
    cardAnchor.href = link;
    cardAnchor.target = "_blank";
    cardAnchor.className = "text-decoration-none";
    const cardDiv = document.createElement("div");
    cardDiv.className = "card h-100 bg-dark text-white rounded-4";
    cardDiv.innerHTML = `
            <img src="${imageUrl}" class="card-img-top rounded-top-4" alt="${title}" loading="lazy"/>
            <div class="card-body p-3 d-flex flex-column">
                <p class="card-text news-title fw-semibold mb-2">${title}</p>
                <p class="card-text-excerpt mb-2">${excerpt}</p>
                <p class="text-white small mt-auto mb-0 time-ago">${timeAgo}</p>
            </div>
        `;
    cardAnchor.appendChild(cardDiv);
    cardColumn.appendChild(cardAnchor);
    cardGridContainer.appendChild(cardColumn);
  });
}
