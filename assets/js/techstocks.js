const apiKey = "d0l18q9r01qhb025lu10d0l18q9r01qhb025lu1g"; // Ganti dengan API Key Finnhub
const symbols = [
  "AAPL", // Apple
  "MSFT", // Microsoft
  "GOOGL", // Alphabet (Google)
  "AMZN", // Amazon
  "META", // Meta Platforms (Facebook)
  "NVDA", // NVIDIA
  "TSLA", // Tesla
  "AMD", // Advanced Micro Devices
  "INTC", // Intel
  "CRM", // Salesforce
  "ORCL", // Oracle
  "ADBE", // Adobe
  "CSCO", // Cisco Systems
  "IBM", // IBM
  "QCOM", // Qualcomm
  "AVGO", // Broadcom
  "TXN", // Texas Instruments
  "SHOP", // Shopify
  "SNOW", // Snowflake
  "NET", // Cloudflare
  "ZM", // Zoom Video
  "PLTR", // Palantir
  "ASML", // ASML Holding
  "SQ", // Block (ex Square)
  "PYPL", // PayPal
  "UBER", // Uber Technologies
  "LYFT", // Lyft
  "TWLO", // Twilio
  "DOCU", // DocuSign
  "ROKU", // Roku
  "FSLY", // Fastly
  "SPOT", // Spotify
  "DDOG", // Datadog
  "TEAM", // Atlassian
  "INTU", // Intuit
  "NOW", // ServiceNow
  "MDB", // MongoDB
  "PANW", // Palo Alto Networks
  "FTNT", // Fortinet
  "WDAY", // Workday
  "AKAM", // Akamai
];

const container = document.getElementById("stock-cards");
const searchInput = document.getElementById("searchInputTeknologi");
const noResultsMessage = document.getElementById("noResultsMessageTeknologi");

async function fetchStock(symbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      symbol,
      price: data.c,
      change: data.d,
      percent: data.dp,
    };
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err);
    return null;
  }
}

async function displayStocks() {
  container.innerHTML = "";
  for (const symbol of symbols) {
    const stock = await fetchStock(symbol);
    if (!stock || stock.price === 0) continue;

    const card = document.createElement("div");
    card.className = "col-md-4 stock-card-item";
    card.innerHTML = `
      <div class="card shadow-sm border-${
        stock.change >= 0 ? "success" : "danger"
      }">
        <div class="card-body">
          <h5 class="card-title">${stock.symbol}</h5>
          <p class="card-text">
            Harga: $${stock.price.toFixed(2)}<br>
            Perubahan: <span class="text-${
              stock.change >= 0 ? "success" : "danger"
            }">
              ${stock.percent.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>
    `;
    container.appendChild(card);
  }

  applySearchFilter();
}

function applySearchFilter() {
  const keyword = searchInput.value.toUpperCase();
  const cards = document.querySelectorAll(".stock-card-item");
  let hasResult = false;

  cards.forEach((card) => {
    const symbol = card.querySelector(".card-title").textContent.toUpperCase();
    const match = symbol.includes(keyword);
    card.style.display = match ? "block" : "none";
    if (match) hasResult = true;
  });

  noResultsMessage.style.display = hasResult ? "none" : "block";
}

searchInput.addEventListener("input", applySearchFilter);

displayStocks();
