// File: assets/js/script.js

document.addEventListener("DOMContentLoaded", () => {
  const enterSiteLink = document.querySelector(".enter-site-link");

  if (enterSiteLink) {
    enterSiteLink.addEventListener("click", function (event) {
      event.preventDefault(); // Mencegah navigasi langsung

      const destinationUrl = this.href;
      // Durasi animasi BARU dalam milidetik (sesuaikan dengan animation-duration di CSS)
      const animationDuration = 500; // 0.5 detik

      // Tambahkan kelas BARU untuk memicu animasi simpel
      this.classList.add("clicked-effect");

      // Atur timeout untuk navigasi setelah animasi selesai
      setTimeout(() => {
        window.location.href = destinationUrl;
      }, animationDuration);
    });
  } else {
    console.error(".enter-site-link element NOT FOUND!");
  }
});
