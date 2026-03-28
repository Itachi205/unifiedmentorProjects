(function () {
  const app = window.GasApp;

  document.addEventListener("DOMContentLoaded", async () => {
    await app?.syncAuthLinks();

    document.querySelectorAll("[data-menu-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const nav = document.querySelector(toggle.dataset.menuToggle);
        nav?.classList.toggle("is-open");
      });
    });

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.flexslider) {
      window.jQuery(".flexslider").flexslider({
        animation: "slide",
        slideshowSpeed: 4500,
        animationSpeed: 600,
      });
    } else {
      const slides = Array.from(document.querySelectorAll(".slides > li"));
      let currentIndex = 0;
      if (slides.length > 1) {
        slides.forEach((slide, index) => {
          slide.style.display = index === 0 ? "block" : "none";
        });

        window.setInterval(() => {
          slides[currentIndex].style.display = "none";
          currentIndex = (currentIndex + 1) % slides.length;
          slides[currentIndex].style.display = "block";
        }, 4000);
      }
    }

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        app?.logout();
      });
    });
  });
})();
