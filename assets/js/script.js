// File: assets/js/script.js

document.addEventListener("DOMContentLoaded", () => {
  const enterSiteLink = document.querySelector(".enter-site-link");
  const portalEffectDiv = document.getElementById("portal-effect"); // Ambil elemen portal

  if (enterSiteLink && portalEffectDiv) {
    // Pastikan kedua elemen ada
    enterSiteLink.addEventListener("click", function (event) {
      event.preventDefault(); // Mencegah navigasi langsung

      const destinationUrl = this.href;
      // Durasi animasi portal (HARUS SAMA dengan animation-duration di CSS #portal-effect.active)
      const portalAnimationDuration = 1200; // 1.2 detik dalam milidetik

      // 1. Buat tombol "ENTER SITE" menghilang/mengecil
      this.classList.add("portal-fade-out");

      // 2. Aktifkan animasi portal
      portalEffectDiv.classList.add("active");

      // Atur timeout untuk navigasi setelah animasi portal selesai
      setTimeout(() => {
        window.location.href = destinationUrl;
      }, portalAnimationDuration); // Gunakan durasi animasi portal
    });
  } else {
    if (!enterSiteLink) {
      console.error(".enter-site-link element NOT FOUND!");
    }
    if (!portalEffectDiv) {
      console.error("#portal-effect element NOT FOUND! Pastikan ada di HTML.");
    }
  }
});
