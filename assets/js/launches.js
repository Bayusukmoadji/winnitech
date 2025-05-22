document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("globalSearchInput");
  const launchCardsContainer = document.getElementById("launchCards");
  const noResultsMessageLaunches = document.getElementById(
    "noResultsMessageLaunches"
  );
  const navSearchForm = document.getElementById("navSearchFormGlobal");

  const allLaunchItems = launchCardsContainer
    ? Array.from(launchCardsContainer.children)
    : [];

  function applyLaunchSearchFilter() {
    if (!searchInput || !launchCardsContainer || !noResultsMessageLaunches) {
      if (allLaunchItems.length > 0 && launchCardsContainer) {
        allLaunchItems.forEach((item) => (item.style.display = ""));
      }
      if (noResultsMessageLaunches)
        noResultsMessageLaunches.style.display = "none";
      return;
    }

    const keyword = searchInput.value.toLowerCase().trim();
    let hasResult = false;

    allLaunchItems.forEach((item) => {
      const titleElement = item.querySelector(".launch-title");
      const companyElement = item.querySelector(".launch-company");
      let textToSearch = "";

      if (titleElement) {
        textToSearch += titleElement.textContent.toLowerCase();
      }
      if (companyElement) {
        textToSearch += " " + companyElement.textContent.toLowerCase();
      }

      if (keyword === "" || textToSearch.includes(keyword)) {
        item.style.display = "";
        hasResult = true;
      } else {
        item.style.display = "none";
      }
    });

    if (keyword !== "" && !hasResult) {
      noResultsMessageLaunches.style.display = "block";
    } else {
      noResultsMessageLaunches.style.display = "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyLaunchSearchFilter);
  }

  if (navSearchForm) {
    navSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Launch page search form submission prevented.");
    });
  }

  if (launchCardsContainer && allLaunchItems.length > 0) {
    applyLaunchSearchFilter();
  } else if (
    launchCardsContainer &&
    allLaunchItems.length === 0 &&
    noResultsMessageLaunches
  ) {
    if (!searchInput || searchInput.value.trim() === "") {
      noResultsMessageLaunches.textContent =
        "No launch products available at the moment.";
      noResultsMessageLaunches.style.display = "block";
    }
  }
});
