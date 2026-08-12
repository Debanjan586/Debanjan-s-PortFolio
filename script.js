let hero       = document.querySelector(".hero");
let nav        = document.querySelector("nav");
let eyebrow    = document.querySelector(".eyebrow");
let h1         = document.querySelector("#hero-main-content h1");
let skills     = document.querySelector(".skills");
let buttons    = document.querySelector("#buttons");
let hamburger  = document.querySelector(".hamburger");
let mobileNav  = document.querySelector("#mobile-nav");
let navOverlay = document.querySelector("#nav-overlay");

gsap.set(nav,     { opacity: 0 });
gsap.set(eyebrow, { opacity: 0, y: 20, width: "90%" });
gsap.set(h1,      { opacity: 0, y: 50 });
gsap.set(skills,  { opacity: 0, y: 20, width: "90%" });
gsap.set(buttons, { opacity: 0, y: 20, width: "90%" });

let heroImage       = document.createElement("img");
heroImage.src       = "./resources/hero-background-image.png";
heroImage.alt       = "";
heroImage.className = "hero-background";
gsap.set(heroImage, { opacity: 1 });
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
  let tl = gsap.timeline();

  tl.to(nav, {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out",
  });

  tl.to(eyebrow, {
    opacity: 1,
    width: "75%",
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.1");

  tl.to(h1, {
    opacity: 1,
    y: 0,
    duration: 1.0,
    ease: "power3.out",
  }, "-=0.1");

  tl.to(skills, {
    opacity: 1,
    width: "65%",
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.3");

  tl.to(buttons, {
    opacity: 1,
    width: "75%",
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.3");

  if (window.videoCanPlay) {
    tl.call(function () { crossfadeToVideo(); });
  } else {
    window.onVideoReady = function () {
      crossfadeToVideo();
    };
  }
};

function crossfadeToVideo() {
  heroVideo.currentTime = 0;
  gsap.set(heroVideo, { opacity: 0 });
  hero.appendChild(heroVideo);
  heroVideo.play().catch(function () {});
  gsap.to(heroVideo, {
    opacity: 1,
    duration: 1.8,
    ease: "power2.inOut",
    delay: 0.1,
    onComplete: function () {
      gsap.to(heroImage, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: function () {
          heroImage.remove();
        }
      });
    }
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
    let isOpen = mobileNav.classList.contains("open");
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