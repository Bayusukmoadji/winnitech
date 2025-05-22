// File: ../assets/js/news.js

const BASE_API_URL = "https://techcrunch.com/wp-json/wp/v2/posts";
const POSTS_PER_PAGE = 11;
const SEARCH_RESULTS_PER_PAGE = 9;

let allFetchedGeneralPosts = [];
let displayedPostIds = new Set();
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
    carouselItemsContainer.appendChild(carouselItemDiv);
  });
  if (heroCarouselWrapper) heroCarouselWrapper.style.display = "block"; // Pastikan wrapper terlihat
  if (descriptionTextElement) descriptionTextElement.style.display = "block"; // Pastikan deskripsi terlihat
}

// --- FUNGSI displayPostsInGrid YANG DIPERBAIKI ---
function displayPostsInGrid(posts, append = false) {
  if (!cardGridContainer) return;

  if (!append) {
    cardGridContainer.innerHTML = "";
  }

  // Logika untuk pesan "No results"
  // Tampilkan "no results" hanya jika ada search term aktif dan hasilnya memang kosong.
  // Jangan tampilkan "no results" saat load awal jika API gagal tapi search term kosong.
  if (posts.length === 0 && !append && currentSearchTerm) {
    if (noResultsMessage) noResultsMessage.style.display = "block";
  } else {
    if (noResultsMessage) noResultsMessage.style.display = "none";
  }

  posts.forEach((post) => {
    const cardElement = createCardElement(post);
    cardGridContainer.appendChild(cardElement);
    // displayedPostIds di-update di sini untuk melacak apa yang sudah dirender ke DOM.
    // Ini penting untuk "Load More" agar tidak menampilkan duplikat jika API mengirim ulang data yang sama.
    displayedPostIds.add(post.id);
  });
}
// --- AKHIR PERBAIKAN displayPostsInGrid ---

async function fetchNews(url, isSearch = false) {
  if (loadMoreButton) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading...";
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (
        response.status === 400 &&
        (isSearch || currentPage > 1 || currentSearchPage > 1)
      ) {
        console.warn(
          `No more posts or invalid page (status 400) for URL: ${url}`
        );
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
    }
    const posts = await response.json();
    // Filter duplikat berdasarkan displayedPostIds HANYA jika BUKAN search query baru dari awal
    // atau jika kita secara eksplisit mau menambahkan ke set global.
    // Untuk fetchNews general, kita pastikan post yang dikembalikan belum pernah ditambahkan ke allFetchedGeneralPosts.
    if (!isSearch) {
      return posts.filter((post) => !displayedPostIds.has(post.id));
    }
    return posts; // Untuk search, biarkan apa adanya, duplikasi dihandle saat display atau penambahan ke allFetchedGeneralPosts
  } catch (error) {
    console.error("Error fetching news:", error);
    if (cardGridContainer && cardGridContainer.innerHTML === "") {
      cardGridContainer.innerHTML = `<p class="text-danger text-center col-12 p-3">Failed to load news. Please try again later.</p>`;
    }
    return [];
  } finally {
    if (loadMoreButton) {
      loadMoreButton.disabled = false;
      // Teks akan diatur oleh logika pemanggil
    }
  }
}

async function loadInitialView() {
  currentSearchTerm = ""; // Pastikan search term kosong
  if (searchInput) searchInput.value = ""; // Kosongkan input field juga
  currentPage = 1;
  displayedPostIds.clear();
  allFetchedGeneralPosts = [];

  const initialPosts = await fetchNews(
    `${BASE_API_URL}?per_page=${POSTS_PER_PAGE}&page=1&_embed`
  );
  if (initialPosts.length > 0) {
    // `displayedPostIds` akan diisi oleh `displayPostsInGrid` dan `renderInitialCarousel` (jika ada logika add di sana)
    // Untuk carousel, kita tidak perlu `displayedPostIds` karena ia selalu menampilkan 3 pertama dari set yang diberikan.
    // `allFetchedGeneralPosts` adalah sumber utama untuk berita umum.
    initialPosts.forEach((post) => displayedPostIds.add(post.id)); // Tandai semua yang diambil dari API awal
    allFetchedGeneralPosts = initialPosts;

    renderInitialCarousel(allFetchedGeneralPosts); // Menggunakan allFetchedGeneralPosts (slice 0-3 internal)
    displayPostsInGrid(allFetchedGeneralPosts.slice(3)); // Tampilkan sisa post (setelah 3 untuk carousel)

    if (loadMoreButton) {
      loadMoreButton.textContent = "Load More";
      loadMoreButton.style.display =
        initialPosts.length < POSTS_PER_PAGE ? "none" : "block";
    }
  } else {
    if (heroCarouselWrapper && carouselItemsContainer)
      carouselItemsContainer.innerHTML =
        "<p class='text-danger text-center p-3'>No news found for carousel.</p>";
    if (cardGridContainer)
      cardGridContainer.innerHTML =
        "<p class='text-danger text-center p-3 col-12'>No news available at the moment.</p>";
    if (loadMoreButton) loadMoreButton.style.display = "none";
  }
}

async function performSearchQuery(term) {
  currentSearchTerm = term.toLowerCase().trim();
  currentSearchPage = 1;

  if (heroCarouselWrapper) heroCarouselWrapper.style.display = "none";
  if (descriptionTextElement) descriptionTextElement.style.display = "none";

  if (!currentSearchTerm) {
    loadInitialView();
    return;
  }

  // Untuk search, kita kosongkan grid dan displayedPostIds agar hasil benar-benar baru
  if (cardGridContainer) cardGridContainer.innerHTML = "";
  displayedPostIds.clear(); // Reset ID yang ditampilkan untuk konteks pencarian baru

  const searchUrl = `${BASE_API_URL}?search=${encodeURIComponent(
    currentSearchTerm
  )}&per_page=${SEARCH_RESULTS_PER_PAGE}&page=${currentSearchPage}&_embed`;
  const searchResults = await fetchNews(searchUrl, true); // isSearch = true

  displayPostsInGrid(searchResults); // Tampilkan hasil pencarian

  if (loadMoreButton) {
    loadMoreButton.textContent = "Load More Results";
    loadMoreButton.style.display =
      searchResults.length < SEARCH_RESULTS_PER_PAGE ? "none" : "block";
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
    const searchTerm = event.target.value.trim();
    if (searchTerm === "" && currentSearchTerm !== "") {
      searchDebounceTimer = setTimeout(() => {
        performSearchQuery(""); // Panggil dengan term kosong untuk reset ke initial view
      }, 500);
    }
  });
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", async function () {
    let newPosts;
    if (currentSearchTerm) {
      currentSearchPage++;
      const searchUrl = `${BASE_API_URL}?search=${encodeURIComponent(
        currentSearchTerm
      )}&per_page=${SEARCH_RESULTS_PER_PAGE}&page=${currentSearchPage}&_embed`;
      newPosts = await fetchNews(searchUrl, true); // isSearch = true
    } else {
      currentPage++;
      const generalUrl = `${BASE_API_URL}?per_page=${POSTS_PER_PAGE}&page=${currentPage}&_embed`;
      newPosts = await fetchNews(generalUrl); // isSearch = false (default)
      // Filter lagi untuk memastikan tidak ada duplikasi dengan allFetchedGeneralPosts
      const uniqueNewPosts = newPosts.filter(
        (post) => !allFetchedGeneralPosts.find((p) => p.id === post.id)
      );
      allFetchedGeneralPosts = allFetchedGeneralPosts.concat(uniqueNewPosts);
      newPosts = uniqueNewPosts; // Hanya append yang benar-benar baru ke DOM
    }

    if (newPosts.length > 0) {
      displayPostsInGrid(newPosts, true); // Append hasil
      loadMoreButton.textContent = currentSearchTerm
        ? "Load More Results"
        : "Load More";
      // Sembunyikan tombol jika jumlah post yang baru < dari yang diminta per halaman
      const limit = currentSearchTerm
        ? SEARCH_RESULTS_PER_PAGE
        : POSTS_PER_PAGE;
      if (newPosts.length < limit) {
        loadMoreButton.style.display = "none";
        loadMoreButton.textContent = currentSearchTerm
          ? "No More Results"
          : "No More News";
      }
    } else {
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
