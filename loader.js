const DEV_MODE = false; // change to true while developing to skip the loader


document.addEventListener("DOMContentLoaded", function () {
  // --------------------------------------------------
  // ELEMENTS
  // --------------------------------------------------

  var loader     = document.getElementById("loader");
  var panelLeft  = document.querySelector(".loader-panel--left");
  var panelRight = document.querySelector(".loader-panel--right");

  var ll1 = document.getElementById("ll-1");
  var ll2 = document.getElementById("ll-2");
  var ll3 = document.getElementById("ll-3");

  var hero = document.querySelector(".hero");


  // --------------------------------------------------
  // DEVICE CHECK
  // --------------------------------------------------

  var isDesktop = window.innerWidth >= 769;
  // breakpoint: below this = mobile behaviour


  // --------------------------------------------------
  // DEVELOPMENT MODE
  // --------------------------------------------------

  if (DEV_MODE) {
    loader.style.display = "none";
    return;
  }


  // --------------------------------------------------
  // INITIAL HERO STATE
  // --------------------------------------------------

  if (isDesktop) {
    gsap.set(hero, {
      scale: 0.85,
      transformOrigin: "center center",
    });
  }


  // --------------------------------------------------
  // INITIAL LOADER STATE
  // --------------------------------------------------

  gsap.set([ll1, ll2, ll3], {
    opacity: 0,
    x: 0,
    y: 14,
  });

  gsap.set([panelLeft, panelRight], {
    x: "0%",
  });


  // --------------------------------------------------
  // LOCK PAGE SCROLL
  // --------------------------------------------------

  document.body.style.overflow = "hidden";


  // --------------------------------------------------
  // MASTER LOADER TIMELINE
  // --------------------------------------------------

  var tl = gsap.timeline({
    defaults: {
      overwrite: "auto",
    },

    onComplete: function () {
      loader.remove();
      document.body.style.overflow = "";
      window.revealHero();
    },
  });


  // ==================================================
  // MESSAGE 1
  // Show first, then PAUSE and wait for video to be ready
  // ==================================================

  tl.to(ll1, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power2.inOut",
  });

  // Pause here — will be resumed once video is ready
  tl.addPause("+=0", function () {
    if (window.videoCanPlay) {
      // Video already ready — resume immediately
      tl.resume();
    } else {
      // Video not ready yet — wait for it
      window.onVideoReady = function () {
        window.onVideoReady = null;
        tl.resume();
      };
    }
  });


  // --------------------------------------------------
  // LINE 1 HOLD (after video confirmed ready)
  // --------------------------------------------------

  tl.to({}, {
    duration: 1.0,
  });


  // --------------------------------------------------
  // LINE 1 FADE OUT
  // --------------------------------------------------

  tl.to(ll1, {
    opacity: 0,
    duration: 0.8,
    ease: "power2.inOut",
  });


  // --------------------------------------------------
  // BREATHING GAP
  // --------------------------------------------------

  tl.to({}, {
    duration: 0.4,
  });


  // ==================================================
  // MESSAGE 2
  // ==================================================

  tl.to(ll2, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.inOut",
  });


  // --------------------------------------------------
  // LINE 2 HOLD
  // --------------------------------------------------

  tl.to({}, {
    duration: 1.5,
  });


  // --------------------------------------------------
  // LINE 2 FADE OUT
  // --------------------------------------------------

  tl.to(ll2, {
    opacity: 0,
    duration: 0.9,
    ease: "power2.inOut",
  });


  // --------------------------------------------------
  // BREATHING GAP
  // --------------------------------------------------

  tl.to({}, {
    duration: 0.4,
  });


  // ==================================================
  // MESSAGE 3
  // ==================================================

  tl.to(ll3, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.inOut",
  });


  // --------------------------------------------------
  // LINE 3 HOLD
  // --------------------------------------------------

  tl.to({}, {
    duration: 1.8,
  });


  // --------------------------------------------------
  // LINE 3 FADE OUT
  // --------------------------------------------------

  tl.to(ll3, {
    opacity: 0,
    duration: 1,
    ease: "power2.inOut",
  });


  // ==================================================
  // FINAL PAUSE
  // ==================================================

  tl.to({}, {
    duration: 0.12,
  });


  // ==================================================
  // SPLIT PANELS
  // ==================================================

  tl.to(
    [panelLeft, panelRight],
    {
      x: function (index) {
        return index === 0 ? "-100%" : "100%";
      },
      duration: 1.1,
      ease: "power4.inOut",
    }
  );


  // ==================================================
  // LOADER FADE OUT
  // ==================================================

  tl.to(
    loader,
    {
      opacity: 0,
      duration: 0.25,
      ease: "power2.out",
    },
    "-=0.25"
  );


  // ==================================================
  // HERO SCALE DOWN — DESKTOP / TABLET ONLY
  // ==================================================

  if (isDesktop) {
    tl.to(
      hero,
      {
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.7"
    );
  }
});