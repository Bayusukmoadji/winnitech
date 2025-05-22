const BASE_API_URL = "https://techcrunch.com/wp-json/wp/v2/posts";
const POSTS_PER_PAGE = 11;
const API_ITEMS_PER_SEARCH_PAGE = 30;
const API_FIELDS_PARAM = "_fields=id,date,link,title,excerpt,_links";
const API_EMBED_PARAM = "_embed=wp:featuredmedia";

let allFetchedGeneralPosts = [];
let displayedPostIds = new Set();
let displayedImageUrls = new Set();
let currentPage = 1;
let currentSearchPage = 1;
let currentSearchTerm = "";

const carouselItemsContainer = document.getElementById("carouselItems");
const cardGridContainer = document.getElementById("cardGrid");
const searchInput = document.getElementById("globalSearchInput");
const navSearchForm = document.getElementById("navSearchFormGlobal");
const noResultsMessage = document.getElementById("noResultsMessageTeknologi");
const loadMoreButton = document.getElementById("loadMoreButton");
const heroCarouselWrapper = document.querySelector(".hero-carousel-wrapper");
const descriptionTextElement = document.querySelector(".description-text");

function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const secondsPast = Math.floor((now.getTime() - past.getTime()) / 1000);
  if (secondsPast < 60) return "Just now";
  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60)
    return `about ${minutesPast} minute${minutesPast === 1 ? "" : "s"} ago`;
  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24)
    return `about ${hoursPast} hour${hoursPast === 1 ? "" : "s"} ago`;
  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast === 1) return "Yesterday";
  if (daysPast < 7)
    return `about ${daysPast} day${daysPast === 1 ? "" : "s"} ago`;
  return past.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function createCardElement(post) {
  const imageUrl =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    `https://via.placeholder.com/500x300/2c3e50/e0e0e0?text=No+Image`;
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
  return cardColumn;
}

function renderInitialCarousel(posts) {
  if (!carouselItemsContainer || !heroCarouselWrapper) return;
  carouselItemsContainer.innerHTML = "";
  posts.slice(0, 3).forEach((post, index) => {
    const imageUrl =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      `https://via.placeholder.com/900x500/2c3e50/e0e0e0?text=No+Image`;
    const title = post.title.rendered;
    const link = post.link;
    const timeAgo = formatTimeAgo(post.date);
    const carouselItemAnchor = document.createElement("a");
    carouselItemAnchor.href = link;
    carouselItemAnchor.target = "_blank";
    carouselItemAnchor.className = "text-decoration-none";
    const carouselItemDiv = document.createElement("div");
    carouselItemDiv.className = `carousel-item ${
      index === 0 ? "active" : ""
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
  });
  if (heroCarouselWrapper) heroCarouselWrapper.style.display = "block";
  if (descriptionTextElement) descriptionTextElement.style.display = "block";
}

function showLoadingIndicator(message) {
  if (cardGridContainer) {
    cardGridContainer.className = "row card-grid-loading";
    cardGridContainer.innerHTML = `
      <div class="col-12">
        <div class="loading-indicator-content">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 loading-indicator-text">${message}</p>
        </div>
      </div>`;
  }
  if (noResultsMessage) noResultsMessage.style.display = "none";
}

function restoreCardGridClass() {
  if (cardGridContainer) {
    cardGridContainer.className =
      "row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4";
  }
}

function displayPostsInGrid(posts, append = false) {
  if (!cardGridContainer) return;

  if (!append) {
    restoreCardGridClass();
    cardGridContainer.innerHTML = "";
  }

  if (posts.length === 0 && !append && currentSearchTerm) {
    if (noResultsMessage) noResultsMessage.style.display = "block";
  } else {
    if (noResultsMessage) noResultsMessage.style.display = "none";
  }

  posts.forEach((post) => {
    const originalImageUrl =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    if (currentSearchTerm && originalImageUrl) {
      if (displayedImageUrls.has(originalImageUrl)) {
        console.log(
          `Skipping article "${post.title.rendered}" due to duplicate image in search: ${originalImageUrl}`
        );
        return;
      }
      displayedImageUrls.add(originalImageUrl);
    }

    const cardElement = createCardElement(post);
    cardGridContainer.appendChild(cardElement);
  });
}

async function fetchNews(url, isSearchOperation = false, forLoadMore = false) {
  if (loadMoreButton && forLoadMore) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading...";
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400) {
        console.warn(`API request to ${url} returned status 400.`);
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    if (
      cardGridContainer &&
      (cardGridContainer.innerHTML.includes("spinner-border") ||
        cardGridContainer.innerHTML === "")
    ) {
      restoreCardGridClass();
      cardGridContainer.innerHTML = `<p class="text-danger text-center col-12 p-3">Failed to load news. Please try again later.</p>`;
    }
    return [];
  } finally {
    if (loadMoreButton && forLoadMore) {
      loadMoreButton.disabled = false;
    }
  }
}

async function loadInitialView() {
  currentSearchTerm = "";
  if (searchInput) searchInput.value = "";
  currentPage = 1;
  displayedPostIds.clear();
  allFetchedGeneralPosts = [];

  showLoadingIndicator("Loading initial news...");

  if (heroCarouselWrapper) heroCarouselWrapper.style.display = "block";
  if (descriptionTextElement) descriptionTextElement.style.display = "block";
  if (carouselItemsContainer) carouselItemsContainer.innerHTML = "";

  const url = `${BASE_API_URL}?per_page=${POSTS_PER_PAGE}&page=1&${API_EMBED_PARAM}&${API_FIELDS_PARAM}`;
  const fetchedPosts = await fetchNews(url);

  if (fetchedPosts.length > 0) {
    fetchedPosts.forEach((post) => {
      if (!displayedPostIds.has(post.id)) {
        allFetchedGeneralPosts.push(post);
        displayedPostIds.add(post.id);
      }
    });

    renderInitialCarousel(allFetchedGeneralPosts);
    displayPostsInGrid(allFetchedGeneralPosts.slice(3));

    if (loadMoreButton) {
      loadMoreButton.textContent = "Load More";
      loadMoreButton.style.display =
        allFetchedGeneralPosts.length < POSTS_PER_PAGE ? "none" : "block";
      loadMoreButton.disabled = false;
    }
  } else {
    restoreCardGridClass();
    if (heroCarouselWrapper && carouselItemsContainer)
      carouselItemsContainer.innerHTML =
        "<p class='text-danger text-center p-3'>No news found for carousel.</p>";
    if (cardGridContainer && !cardGridContainer.querySelector(".text-danger")) {
      cardGridContainer.innerHTML =
        "<p class='text-center p-3 col-12'>No news available at the moment.</p>";
    }
    if (loadMoreButton) {
      loadMoreButton.style.display = "none";
      loadMoreButton.textContent = "No More News";
    }
  }
}

async function performSearchQuery(term) {
  const searchTermForFilter = term.toLowerCase().trim();
  currentSearchTerm = searchTermForFilter;
  currentSearchPage = 1;

  if (heroCarouselWrapper) heroCarouselWrapper.style.display = "none";
  if (descriptionTextElement) descriptionTextElement.style.display = "none";

  if (!currentSearchTerm) {
    loadInitialView();
    return;
  }

  showLoadingIndicator("Searching for articles...");
  displayedImageUrls.clear();

  const searchUrl = `${BASE_API_URL}?search=${encodeURIComponent(
    currentSearchTerm
  )}&per_page=${API_ITEMS_PER_SEARCH_PAGE}&page=${currentSearchPage}&${API_EMBED_PARAM}&${API_FIELDS_PARAM}`;

  if (loadMoreButton) {
    loadMoreButton.disabled = true;
  }

  const apiResults = await fetchNews(searchUrl, true, false);

  let titleFilteredResults = [];
  if (apiResults && apiResults.length > 0) {
    titleFilteredResults = apiResults.filter((post) =>
      post.title.rendered.toLowerCase().includes(searchTermForFilter)
    );
  }

  displayPostsInGrid(titleFilteredResults, false);

  if (loadMoreButton) {
    if (apiResults.length < API_ITEMS_PER_SEARCH_PAGE) {
      loadMoreButton.style.display = "none";
      loadMoreButton.textContent = "No More Results";
    } else {
      loadMoreButton.style.display = "block";
      loadMoreButton.textContent = "Load More Results";
    }
    loadMoreButton.disabled = loadMoreButton.style.display === "none";

    if (
      titleFilteredResults.length === 0 &&
      apiResults.length > 0 &&
      apiResults.length < API_ITEMS_PER_SEARCH_PAGE
    ) {
      loadMoreButton.textContent = "No More Title Matches On This Page";
    } else if (apiResults.length === 0) {
      loadMoreButton.style.display = "none";
    }
  }
}

if (navSearchForm) {
  navSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (searchInput) {
      performSearchQuery(searchInput.value);
    }
  });
}

if (searchInput) {
  let searchDebounceTimer;
  searchInput.addEventListener("input", function (event) {
    clearTimeout(searchDebounceTimer);
    const searchTermValue = event.target.value.trim();
    if (searchTermValue === "" && currentSearchTerm !== "") {
      searchDebounceTimer = setTimeout(() => {
        performSearchQuery("");
      }, 500);
    }
  });
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", async function () {
    let newApiPosts;
    let newTitleFilteredPosts = [];

    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading...";

    if (currentSearchTerm) {
      currentSearchPage++;
      const searchUrl = `${BASE_API_URL}?search=${encodeURIComponent(
        currentSearchTerm
      )}&per_page=${API_ITEMS_PER_SEARCH_PAGE}&page=${currentSearchPage}&${API_EMBED_PARAM}&${API_FIELDS_PARAM}`;
      newApiPosts = await fetchNews(searchUrl, true, true);

      if (newApiPosts && newApiPosts.length > 0) {
        newTitleFilteredPosts = newApiPosts.filter((post) =>
          post.title.rendered.toLowerCase().includes(currentSearchTerm)
        );
      }
    } else {
      currentPage++;
      const generalUrl = `${BASE_API_URL}?per_page=${POSTS_PER_PAGE}&page=${currentPage}&${API_EMBED_PARAM}&${API_FIELDS_PARAM}`;
      newApiPosts = await fetchNews(generalUrl, false, true);

      newApiPosts.forEach((post) => {
        allFetchedGeneralPosts.push(post);
        displayedPostIds.add(post.id);
      });
      newTitleFilteredPosts = newApiPosts;
    }

    if (newTitleFilteredPosts.length > 0) {
      restoreCardGridClass();
      displayPostsInGrid(newTitleFilteredPosts, true);
    }

    loadMoreButton.disabled = false;
    const limit = currentSearchTerm
      ? API_ITEMS_PER_SEARCH_PAGE
      : POSTS_PER_PAGE;

    if (newApiPosts.length < limit) {
      loadMoreButton.style.display = "none";
      loadMoreButton.textContent = currentSearchTerm
        ? "No More Results"
        : "No More News";
    } else {
      loadMoreButton.style.display = "block";
      loadMoreButton.textContent = currentSearchTerm
        ? "Load More Results"
        : "Load More";
      if (
        newTitleFilteredPosts.length === 0 &&
        currentSearchTerm &&
        newApiPosts.length > 0
      ) {
        loadMoreButton.textContent = "Load More Results (checking titles...)";
      }
    }
    if (
      newApiPosts.length === 0 &&
      newTitleFilteredPosts.length === 0 &&
      loadMoreButton.style.display !== "none"
    ) {
      loadMoreButton.textContent = currentSearchTerm
        ? "No More Results"
        : "No More News";
      loadMoreButton.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!searchInput)
    console.warn("Element with ID 'globalSearchInput' not found.");
  if (!navSearchForm)
    console.warn("Element with ID 'navSearchFormGlobal' not found.");
  if (!noResultsMessage)
    console.warn("Element with ID 'noResultsMessageTeknologi' not found.");
  if (!heroCarouselWrapper)
    console.warn("Element with class '.hero-carousel-wrapper' not found.");
  if (!descriptionTextElement)
    console.warn("Element with class '.description-text' not found.");

  loadInitialView();
});
