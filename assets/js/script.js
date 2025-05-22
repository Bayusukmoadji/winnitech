document.addEventListener("DOMContentLoaded", () => {
  const enterSiteLink = document.querySelector(".enter-site-link");

  if (enterSiteLink) {
    enterSiteLink.addEventListener("click", function (event) {
      event.preventDefault();

      const destinationUrl = this.href;
      const animationDuration = 500;

      this.classList.add("clicked-effect");

      setTimeout(() => {
        window.location.href = destinationUrl;
      }, animationDuration);
    });
  } else {
    console.error(".enter-site-link element NOT FOUND!");
  }
});
