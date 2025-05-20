const apiKey = "d0l18q9r01qhb025lu10d0l18q9r01qhb025lu1g";
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

async function fetchStockData(symbol) {
  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`;
  const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`;

  try {
    const [quoteRes, profileRes, metricRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl),
      fetch(metricUrl),
    ]);

    if (!quoteRes.ok)
      console.warn(`Failed to fetch quote for ${symbol}: ${quoteRes.status}`);
    if (!profileRes.ok)
      console.warn(
        `Failed to fetch profile for ${symbol}: ${profileRes.status}`
      );
    if (!metricRes.ok)
      console.warn(
        `Failed to fetch metrics for ${symbol}: ${metricRes.status}`
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
    console.error(`Error fetching comprehensive data for ${symbol}:`, err);
    return null;
  }
}

function formatMarketCap(num) {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1.0e12) return (num / 1.0e12).toFixed(2) + "T";
  if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B";
  if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M";
  if (num >= 1.0e3) return (num / 1.0e3).toFixed(2) + "K";
  return num.toFixed(2);
}

async function displayStocks() {
  if (!container) {
    return;
  }
  container.innerHTML =
    '<div class="col-12 text-center pt-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Fetching stock data, please wait...</p></div>';

  let displayedCount = 0;
  for (const symbol of symbols) {
    const stock = await fetchStockData(symbol);

    if (!stock) {
      continue;
    }

    if (!stock.webURL || stock.webURL.trim() === "") {
      continue;
    }

    if (displayedCount === 0) {
      container.innerHTML = "";
    }
    displayedCount++;

    const card = document.createElement("div");
    card.className = "col-lg-4 col-md-6 col-sm-12 stock-card-item mb-4";

    const isPositiveChange = stock.change >= 0;

    card.innerHTML = `
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
      stock.low !== undefined && stock.low !== null
        ? stock.low.toFixed(2)
        : "N/A"
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
      </div>
    `;
    container.appendChild(card);
  }

  if (displayedCount === 0) {
    if (container.innerHTML.includes("spinner-border")) {
      container.innerHTML =
        '<div class="col-12 text-center pt-5"><p class="text-muted">No stocks with website data could be fetched, or check API key/network.</p></div>';
    } else if (searchInput && searchInput.value.trim() === "") {
      container.innerHTML =
        '<div class="col-12 text-center pt-5"><p class="text-muted">No stocks with website data found.</p></div>';
    }
  }

  applySearchFilter();
}

function applySearchFilter() {
  if (!searchInput || !container) {
    if (noResultsMessage) noResultsMessage.style.display = "none";
    return;
  }
  const keyword = searchInput.value.toUpperCase().trim();
  const cards = container.querySelectorAll(".stock-card-item");
  let hasResult = false;

  cards.forEach((card) => {
    const titleElement = card.querySelector(
      ".stock-company-name, .stock-symbol"
    );
    if (titleElement) {
      const symbolText = titleElement.textContent.toUpperCase();
      const match = keyword === "" || symbolText.includes(keyword);
      card.style.display = match ? "" : "none";
      if (match) hasResult = true;
    } else {
      card.style.display = keyword === "" ? "" : "none";
    }
  });

  if (noResultsMessage) {
    const alreadyRenderedCards =
      container.querySelectorAll(".stock-card-item[style*='display: none;']")
        .length !== cards.length || cards.length > 0;

    if (keyword !== "" && !hasResult && alreadyRenderedCards) {
      noResultsMessage.style.display = "block";
    } else {
      noResultsMessage.style.display = "none";
    }
  }
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
} else {
  if (noResultsMessage) noResultsMessage.style.display = "none";
}

displayStocks();
