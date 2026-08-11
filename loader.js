const DEV_MODE = false; // change to true while developing to skip the loader


document.addEventListener("DOMContentLoaded", function () {
  // --------------------------------------------------
  // ELEMENTS
  // --------------------------------------------------

  var loader = document.getElementById("loader");
  var panelLeft = document.querySelector(".loader-panel--left");
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

  // All lines start slightly below, no horizontal offset
  gsap.set([ll1, ll2, ll3], {
    opacity: 0,
    x: 0,
    y: 14,
  });

  // Both loader panels start in the center position
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
      // Remove loader completely from the DOM
      loader.remove();

      // Unlock everything once loader is finished
      document.body.style.overflow = "";

      // Start the actual hero reveal
      window.revealHero();
    },
  });


// ==================================================
// MESSAGE 1
// "You're about to see how I think."
// ==================================================

tl.to(ll1, {
  opacity: 1,
  duration: 0.9,
  ease: "power2.inOut",
});



// --------------------------------------------------
// LINE 1 HOLD
// --------------------------------------------------

tl.to({}, {
  duration: 1.6,
});



// --------------------------------------------------
// LINE 1 FADE OUT
// Back into the darkness
// --------------------------------------------------

tl.to(ll1, {
  opacity: 0,
  duration: 0.8,
  ease: "power2.inOut",
});



// --------------------------------------------------
// SMALL BREATHING GAP
// --------------------------------------------------

tl.to({}, {
  duration: 0.4,
});



// ==================================================
// MESSAGE 2
// "Entering the experience."
// ==================================================

tl.to(ll2, {
  opacity: 1,
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
// Back into the darkness
// --------------------------------------------------

tl.to(ll2, {
  opacity: 0,
  duration: 0.9,
  ease: "power2.inOut",
});



// --------------------------------------------------
// SMALL BREATHING GAP
// --------------------------------------------------

tl.to({}, {
  duration: 0.4,
});



// ==================================================
// MESSAGE 3
// "Welcome to my world."
// ==================================================

tl.to(ll3, {
  opacity: 1,
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
// Back into the darkness
// --------------------------------------------------

tl.to(ll3, {
  opacity: 0,
  duration: 1,
  ease: "power2.inOut",
});
  // ==================================================
  // FINAL SMALL PAUSE
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
  // HERO SCALE DOWN
  // DESKTOP / TABLET ONLY
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