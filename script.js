let hero      = document.querySelector(".hero");
let hamburger = document.querySelector(".hamburger");
let mobileNav = document.querySelector("#mobile-nav");
let navOverlay = document.querySelector("#nav-overlay");

let heroImage = document.createElement("img");
heroImage.src       = "./resources/hero-background-image.png";
heroImage.alt       = "";
heroImage.className = "hero-background";
gsap.set(heroImage, { opacity: 0 });
hero.appendChild(heroImage);

let heroVideo         = document.createElement("video");
heroVideo.className   = "hero-background";
heroVideo.src         = "./resources/hero-background.mp4";
heroVideo.muted       = true;
heroVideo.loop        = true;
heroVideo.playsInline = true;
heroVideo.preload     = "metadata";
heroVideo.load();

window.videoCanPlay = false;

heroVideo.addEventListener("canplay", function () {
  window.videoCanPlay = true;

  if (window.onVideoReady) {
    window.onVideoReady();
    window.onVideoReady = null;
  }
}, { once: true });

window.revealHero = function () {
  if (window.videoCanPlay) {
    playVideo();
  } else {
    gsap.to(heroImage, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    });

    window.onVideoReady = function () {
      gsap.to(heroImage, { opacity: 0, duration: 0.6, ease: "power2.in",
        onComplete: function () {
          heroImage.remove();
          playVideo();
        }
      });
    };
  }
};

function playVideo() {
  heroVideo.currentTime = 0;
  gsap.set(heroVideo, { opacity: 0 });
  hero.appendChild(heroVideo);
  heroVideo.play().catch(function () {});
  gsap.to(heroVideo, {
    opacity: 1,
    duration: 1.2,
    ease: "power2.out"
  });
}

if (hamburger && mobileNav) {

  function openMenu() {
    mobileNav.classList.add("open");
    navOverlay.classList.add("open");
    mobileNav.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mobileNav.classList.remove("open");
    navOverlay.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", function () {
    var isOpen = mobileNav.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener("click", closeMenu);

  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) {
      closeMenu();
      hamburger.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && mobileNav.classList.contains("open")) {
      closeMenu();
    }
  });

}