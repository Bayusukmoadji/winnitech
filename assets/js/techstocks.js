// File: ../assets/js/techstocks.js

const FINNHUB_API_KEYS = [
  "d0l18q9r01qhb025lu10d0l18q9r01qhb025lu1g",
  "d0o6a4hr01qn5ghngj3gd0o6a4hr01qn5ghngj40",
  "d0o686hr01qn5ghng8egd0o686hr01qn5ghng8f0",
  "d0o69d9r01qn5ghngf40d0o69d9r01qn5ghngf4g",
  "d0o6b11r01qn5ghngnpgd0o6b11r01qn5ghngnq0",
  "d0o6bkpr01qn5ghngrdgd0o6bkpr01qn5ghngre0",
  "d0o6cb9r01qn5ghngvi0d0o6cb9r01qn5ghngvig",
  "d0o6cp9r01qn5ghnh200d0o6cp9r01qn5ghnh20g",
  "d0o6d91r01qn5ghnh550d0o6d91r01qn5ghnh55g",
];
let activeFinnhubApiKey = "";

function selectActiveApiKey() {
  if (
    FINNHUB_API_KEYS.length === 0 ||
    FINNHUB_API_KEYS[0].startsWith("API_KEY_ANDA_")
  ) {
    console.error(
      "Finnhub API Keys are not configured properly in techstocks.js. Please add your actual keys."
    );
    activeFinnhubApiKey = "DUMMY_KEY_PLEASE_CONFIG_YOUR_KEYS";
    if (typeof alert !== "undefined") {
      // Cek jika alert tersedia (tidak error di environment non-browser)
      alert(
        "PENTING: API Key Finnhub belum dikonfigurasi dengan benar di techstocks.js. Data saham tidak akan termuat."
      );
    }
    return;
  }
  let currentIndex = parseInt(
    sessionStorage.getItem("finnhubApiKeyIndex") || "-1"
  );
  currentIndex = (currentIndex + 1) % FINNHUB_API_KEYS.length;
  sessionStorage.setItem("finnhubApiKeyIndex", currentIndex.toString());
  activeFinnhubApiKey = FINNHUB_API_KEYS[currentIndex];
  console.log(
    `Using Finnhub API Key (Index: ${currentIndex}, Key: ${activeFinnhubApiKey.substring(
      0,
      5
    )}...)`
  );
}

const symbols = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "NVDA",
  "TSLA",
  "AMD",
  "INTC",
  "CRM",
  "ORCL",
  "ADBE",
  "CSCO",
  "IBM",
  "QCOM",
  "AVGO",
  "TXN",
  "SHOP",
  "SNOW",
  "NET",
  "ZM",
  "PLTR",
  "ASML",
  "SQ",
  "PYPL",
  "UBER",
  "LYFT",
  "TWLO",
  "DOCU",
  "ROKU",
  "FSLY",
  "SPOT",
  "DDOG",
  "TEAM",
  "INTU",
  "NOW",
  "MDB",
  "PANW",
  "FTNT",
  "WDAY",
  "AKAM",
];

const container = document.getElementById("stock-cards");
const searchInput = document.getElementById("globalSearchInput");
const noResultsMessage = document.getElementById("noResultsMessageTeknologi");
const navSearchForm = document.getElementById("navSearchFormGlobal");

async function fetchStockData(symbol) {
  if (
    !activeFinnhubApiKey ||
    activeFinnhubApiKey === "DUMMY_KEY_PLEASE_CONFIG_YOUR_KEYS"
  ) {
    console.error(`No active API Key for ${symbol}.`);
    return null;
  }
  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${activeFinnhubApiKey}`;
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${activeFinnhubApiKey}`;
  const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${activeFinnhubApiKey}`;
  try {
    const [quoteRes, profileRes, metricRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl),
      fetch(metricUrl),
    ]);
    if (!quoteRes.ok)
      console.warn(
        `Failed to fetch quote for ${symbol}: ${
          quoteRes.status
        } (Key: ${activeFinnhubApiKey.substring(0, 5)}...)`
      );
    if (!profileRes.ok)
      console.warn(
        `Failed to fetch profile for ${symbol}: ${
          profileRes.status
        } (Key: ${activeFinnhubApiKey.substring(0, 5)}...)`
      );
    if (!metricRes.ok)
      console.warn(
        `Failed to fetch metrics for ${symbol}: ${
          metricRes.status
        } (Key: ${activeFinnhubApiKey.substring(0, 5)}...)`
      );
    const quoteData = quoteRes.ok ? await quoteRes.json() : {};
    const profileData = profileRes.ok ? await profileRes.json() : {};
    const metricData = metricRes.ok ? await metricRes.json() : { metric: {} };
    if (
      (!quoteData.c && !quoteData.pc) ||
      (quoteData.c === 0 &&
        quoteData.pc === 0 &&
        quoteData.d === 0 &&
        quoteData.dp === 0)
    ) {
      console.warn(`Insufficient data for ${symbol}, skipping.`);
      return null;
    }
    return {
      symbol: profileData.ticker || symbol,
      price: quoteData.c,
      change: quoteData.d,
      percentChange: quoteData.dp,
      open: quoteData.o,
      high: quoteData.h,
      low: quoteData.l,
      previousClose: quoteData.pc,
      logo: profileData.logo,
      companyName: profileData.name,
      exchange: profileData.exchange,
      industry: profileData.finnhubIndustry,
      ipoDate: profileData.ipo,
      webURL: profileData.weburl,
      marketCap: metricData.metric?.marketCapitalization,
      peRatio: metricData.metric?.peNormalizedAnnual,
      eps: metricData.metric?.epsNormalizedAnnual,
      dividendYield: metricData.metric?.dividendYieldIndicatedAnnual,
      week52High: metricData.metric?.["52WeekHigh"],
      week52Low: metricData.metric?.["52WeekLow"],
    };
  } catch (err) {
    console.error(
      `Error fetching comprehensive data for ${symbol} (Key: ${activeFinnhubApiKey.substring(
        0,
        5
      )}...):`,
      err
    );
    return null;
  }
}

function formatMarketCap(num) {
  if (num === null || num === undefined || isNaN(parseFloat(num))) return "N/A";
  if (num >= 1.0e12) return (num / 1.0e12).toFixed(2) + "T";
  if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B";
  if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M";
  if (num >= 1.0e3) return (num / 1.0e3).toFixed(2) + "K";
  return num.toFixed(2);
}

function createStockCardElement(stock) {
  // Fungsi untuk membuat satu elemen kartu
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-lg-4 col-md-6 col-sm-12 stock-card-item mb-4";
  const isPositiveChange = stock.change >= 0;
  cardDiv.innerHTML = `
      <div class="card shadow-sm stock-card h-100 border-${
        isPositiveChange ? "success-themed" : "danger-themed"
      }">
        <div class="card-header d-flex align-items-center p-3">
          ${
            stock.logo
              ? `<img src="${stock.logo}" alt="${
                  stock.companyName || stock.symbol
                } logo" class="stock-logo me-3">`
              : `<div class="stock-logo-placeholder me-3"><span>${stock.symbol.substring(
                  0,
                  1
                )}</span></div>`
          }
          <div class="stock-info-text">
            <h5 class="card-title stock-company-name mb-0 mt-3">${
              stock.companyName || stock.symbol
            }</h5> 
            <small class="text-muted stock-symbol">${stock.symbol} - ${
    stock.exchange || "N/A"
  }</small>
          </div>
        </div>
        <div class="card-body p-3">
          <div class="row mb-2">
            <div class="col-7 stock-price-large">$${
              stock.price !== undefined && stock.price !== null
                ? stock.price.toFixed(2)
                : "N/A"
            }</div>
            <div class="col-5 text-end stock-change-large text-${
              isPositiveChange ? "success-themed" : "danger-themed"
            }">
              ${
                stock.percentChange !== undefined &&
                stock.percentChange !== null
                  ? stock.percentChange.toFixed(2)
                  : "N/A"
              }%
              <div class="stock-change-absolute">(${
                stock.change !== undefined && stock.change !== null
                  ? stock.change.toFixed(2)
                  : "N/A"
              })</div>
            </div>
          </div>
          <hr class="my-2 stock-divider">
          <div class="stock-details">
            <p><strong>O:</strong> ${
              stock.open !== undefined && stock.open !== null
                ? stock.open.toFixed(2)
                : "N/A"
            } | <strong>H:</strong> ${
    stock.high !== undefined && stock.high !== null
      ? stock.high.toFixed(2)
      : "N/A"
  } | <strong>L:</strong> ${
    stock.low !== undefined && stock.low !== null ? stock.low.toFixed(2) : "N/A"
  }</p>
            <p><strong>Prev. Close:</strong> ${
              stock.previousClose !== undefined && stock.previousClose !== null
                ? stock.previousClose.toFixed(2)
                : "N/A"
            }</p>
            <p><strong>Market Cap:</strong> ${formatMarketCap(
              stock.marketCap
            )}</p>
            <p><strong>P/E Ratio:</strong> ${
              stock.peRatio !== undefined && stock.peRatio !== null
                ? stock.peRatio.toFixed(2)
                : "N/A"
            }</p>
            <p><strong>EPS:</strong> ${
              stock.eps !== undefined && stock.eps !== null
                ? stock.eps.toFixed(2)
                : "N/A"
            }</p>
            <p><strong>52W H/L:</strong> ${
              stock.week52High !== undefined && stock.week52High !== null
                ? stock.week52High.toFixed(2)
                : "N/A"
            } / ${
    stock.week52Low !== undefined && stock.week52Low !== null
      ? stock.week52Low.toFixed(2)
      : "N/A"
  }</p>
            <p><strong>Industry:</strong> ${stock.industry || "N/A"}</p>
          </div>
        </div>
        <div class="card-footer p-2 text-center">
          <a href="${
            stock.webURL
          }" target="_blank" class="btn btn-sm stock-website-link ${
    isPositiveChange ? "link-positive" : "link-negative"
  }">Visit Website</a>
        </div>
      </div>`;
  return cardDiv;
}

// --- FUNGSI displayStocks DIMODIFIKASI untuk memproses simbol dalam chunk ---
async function displayStocks() {
  if (!container) {
    console.error("Stock cards container not found!");
    return;
  }

  if (
    !activeFinnhubApiKey ||
    activeFinnhubApiKey === "DUMMY_KEY_PLEASE_CONFIG_YOUR_KEYS"
  ) {
    container.innerHTML =
      '<div class="col-12 text-center pt-5"><p class="text-danger fs-5">API Key error. Please configure API keys in techstocks.js.</p></div>';
    return;
  }

  container.innerHTML =
    '<div class="col-12 text-center py-5" id="initialLoadingSpinner"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3 loading-indicator-text">Fetching stock data, please wait...</p></div>';
  if (noResultsMessage) noResultsMessage.style.display = "none";

  const CHUNK_SIZE = 7; // Ambil data untuk X simbol sekaligus per batch (X * 3 API calls)
  let displayedCount = 0;
  let initialSpinnerCleared = false;

  for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
    const symbolChunk = symbols.slice(i, i + CHUNK_SIZE);
    console.log(
      `Workspaceing chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${symbolChunk.join(
        ", "
      )} using key ${activeFinnhubApiKey.substring(0, 5)}...`
    );

    const stockDataPromises = symbolChunk.map((symbol) =>
      fetchStockData(symbol)
    );

    try {
      const chunkResults = await Promise.all(stockDataPromises);

      if (!initialSpinnerCleared && container) {
        const spinnerElement = document.getElementById("initialLoadingSpinner");
        if (spinnerElement) spinnerElement.remove(); // Hapus spinner spesifik
        else container.innerHTML = ""; // Fallback jika spinner tidak ditemukan dengan ID
        initialSpinnerCleared = true;
      }

      chunkResults.forEach((stock) => {
        if (stock && stock.webURL && stock.webURL.trim() !== "") {
          const cardElement = createStockCardElement(stock); // Gunakan fungsi terpisah
          if (container) container.appendChild(cardElement);
          displayedCount++;
        } else if (stock) {
          console.warn(
            `Data for ${
              stock.symbol || "a symbol"
            } in chunk was insufficient or skipped (e.g. missing webURL).`
          );
        }
      });
    } catch (chunkError) {
      console.error(`Error processing a chunk of stock data:`, chunkError);
    }

    if (i + CHUNK_SIZE < symbols.length) {
      console.log("Waiting 1 second before fetching next chunk...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Jeda 1 detik
    }
  }

  if (displayedCount === 0) {
    if (container)
      container.innerHTML =
        '<div class="col-12 text-center pt-5"><p class="text-muted fs-5">No stocks with complete data (including website URL) could be displayed.<br>This might be due to API key issues, network problems, or no stocks meeting the criteria.</p></div>';
  }

  applySearchFilter();
}
// --- AKHIR MODIFIKASI displayStocks ---

function applySearchFilter() {
  if (!container) return;
  const keyword = searchInput ? searchInput.value.toUpperCase().trim() : "";
  const cards = container.querySelectorAll(".stock-card-item");
  let hasResult = false;
  cards.forEach((card) => {
    const companyNameElement = card.querySelector(".stock-company-name");
    const symbolElement = card.querySelector(".stock-symbol");
    let textToSearch = "";
    if (companyNameElement)
      textToSearch += companyNameElement.textContent.toUpperCase();
    if (symbolElement)
      textToSearch +=
        " " + symbolElement.textContent.toUpperCase().split(" - ")[0];
    const match = keyword === "" || textToSearch.includes(keyword);
    card.style.display = match ? "" : "none";
    if (match) hasResult = true;
  });
  if (noResultsMessage) {
    noResultsMessage.style.display =
      keyword !== "" && !hasResult && cards.length > 0 ? "block" : "none";
  }
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
} else {
  if (noResultsMessage) noResultsMessage.style.display = "none";
}

if (navSearchForm) {
  navSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Navbar search form submission prevented.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  selectActiveApiKey();
  displayStocks();
});
