/* ══════════════════════════════════════════════════════════════
   NAV LOGIC — single source of truth for all nav behavior.

   Sections:
   1. Active-section underline — thin bar that glides to whichever
                              link matches the current scroll-spy
                              section. Ignores hover entirely;
                              hover only brightens link text via
                              plain CSS.
   2. Scroll-spy           — matches active link to whichever
                              section is closest to the viewport's
                              vertical midpoint, robust at any
                              scroll speed (see section 2 below).
   3. Hero-aware visibility — while #hero is the active section,
                              nav is fully visible (.nav--top),
                              ignoring scroll direction entirely.
                              The instant the active section
                              changes away from hero, nav fades
                              fully invisible on any further
                              downward scroll (.nav--faded), and
                              reveals instantly on any upward
                              scroll at all (.nav--revealed) — the
                              nav never repositions in any of the
                              three states, it only ever fades in
                              place. Returning to hero always
                              forces .nav--top again, overriding
                              whichever of the other two was last
                              active.
   4. Hamburger + overlay  — opens/closes the mobile menu, locks
                              body scroll. No special-case nav
                              handling is needed while open: since
                              scroll is fully locked, no scroll
                              event can fire, so nav simply stays
                              exactly where it was the instant the
                              menu opened, and normal logic resumes
                              the moment it closes.
   5. Nav background fade  — nav starts fully transparent. Past a
                              small scroll threshold (roughly two
                              wheel notches / a slight swipe), the
                              background color fades in smoothly
                              via .nav--scrolled; scrolling back up
                              past that same threshold fades it
                              back out. Fully independent of the
                              hero-aware visibility state — both
                              classes can be active at once.
   ══════════════════════════════════════════════════════════════ */

(function () {
  var nav        = document.querySelector("nav");
  var navLinks   = document.getElementById("nav-links");
  var hero       = document.getElementById("hero");
  var hamburger  = document.querySelector(".hamburger");
  var mobileNav  = document.getElementById("mobile-nav");
  var navOverlay = document.getElementById("nav-overlay");

  if (!nav) return;

  var MOBILE_BREAKPOINT = 768; // must match the CSS max-width breakpoint

  /* ── Hero-aware nav position state (used by sections 2 and 3
     together — see the unified note in section 2 below) ────── */
  var DELTA = 10; // px — minimum scroll movement before reacting
  var isHeroInView = true; // corrected the instant scroll-spy reports in
  var lastScrollY = window.scrollY || document.documentElement.scrollTop;

  function applyPositionState() {
    if (isHeroInView) {
      // Hero always wins, overriding everything else — pinned to
      // top, fully visible, no direction logic at all.
      nav.classList.add("nav--top");
      nav.classList.remove("nav--faded", "nav--revealed");
      return;
    }

    nav.classList.remove("nav--top");

    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var scrollDelta = scrollY - lastScrollY;

    if (scrollDelta > DELTA) {
      // Scrolling down outside hero — fade out completely.
      nav.classList.add("nav--faded");
      nav.classList.remove("nav--revealed");
      lastScrollY = scrollY;
    } else if (scrollDelta < 0) {
      // ANY upward movement outside hero — reveal immediately.
      // (No DELTA threshold here on purpose: the reveal should
      // feel instant on even a slight scroll-up, per the request.)
      nav.classList.add("nav--revealed");
      nav.classList.remove("nav--faded");
      lastScrollY = scrollY;
    }
    // Movement smaller than +DELTA and not negative at all (i.e.
    // essentially stationary): leave current state untouched, and
    // don't update lastScrollY, so tiny jitter keeps comparing
    // against the last committed position instead of drifting.
  }

  /* ══════════════════════════════════════════════════════════
     1. ACTIVE-SECTION UNDERLINE
     ══════════════════════════════════════════════════════════
     A thin bar that sits under whichever link matches the
     current scroll-spy section, and glides smoothly to the new
     link whenever that section changes. It does NOT react to
     hover — hovering a link only brightens its text color (see
     the plain CSS :hover rule on #nav-links a). The underline
     stays put under the active link regardless of what's being
     hovered. ────────────────────────────────────────────────── */

  var pill = null;
  var links = [];
  var activeLink = null; // the link currently matching scroll-spy

  if (navLinks) {
    pill = document.createElement("span");
    pill.className = "nav-pill";
    pill.setAttribute("aria-hidden", "true");
    navLinks.appendChild(pill);

    links = Array.prototype.slice.call(navLinks.querySelectorAll("a"));

    var UNDERLINE_PAD_X = 2; // slight overhang past the text on each side
    var UNDERLINE_GAP = 6;   // px between text baseline and the bar

    function movePillTo(link) {
      if (!link || !pill) return;
      var linkRect = link.getBoundingClientRect();
      var parentRect = navLinks.getBoundingClientRect();

      var x = linkRect.left - parentRect.left - UNDERLINE_PAD_X;
      var y = linkRect.bottom - parentRect.top + UNDERLINE_GAP;
      var w = linkRect.width + UNDERLINE_PAD_X * 2;

      navLinks.style.setProperty("--pill-x", x + "px");
      navLinks.style.setProperty("--pill-y", y + "px");
      navLinks.style.setProperty("--pill-w", w + "px");

      pill.classList.add("nav-pill--visible");
    }

    var pillResizeTicking = false;
    window.addEventListener("resize", function () {
      if (pillResizeTicking) return;
      pillResizeTicking = true;
      window.requestAnimationFrame(function () {
        if (activeLink) movePillTo(activeLink);
        pillResizeTicking = false;
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     2. SCROLL-SPY  (also drives hero-aware nav position — see
        section 3. Both are driven by the SAME signal: whichever
        section is currently marked active here IS what section
        3 uses to decide top-mode vs bottom-stick-mode. There is
        no separate hero-only observer anymore — this is the
        single source of truth for "what section am I on".)
     ══════════════════════════════════════════════════════════ */

  var spyEntries = links
    .map(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return null;
      var section = document.querySelector(href);
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  function setActiveLink(link) {
    if (activeLink === link) return;
    links.forEach(function (l) {
      l.classList.remove("nav-link--active");
    });
    activeLink = link;
    if (activeLink) {
      activeLink.classList.add("nav-link--active");
      movePillTo(activeLink);
    }

    // Drive hero-aware nav position from this exact same event —
    // whichever section just became active IS the ground truth
    // for whether we're "on hero" or not, with zero timing gap
    // between the two systems.
    var href = activeLink ? activeLink.getAttribute("href") : null;
    isHeroInView = href === "#hero";
    lastScrollY = window.scrollY || document.documentElement.scrollTop;
    applyPositionState();
  }

  if (spyEntries.length > 0 && "IntersectionObserver" in window) {
    // Instead of trusting whichever section has the largest
    // intersectionRatio inside a narrow center band (which can
    // miss updates entirely on a slow scroll through short
    // sections), we track every observed section's visibility
    // and — on every callback — pick whichever VISIBLE section's
    // vertical midpoint is closest to the viewport's own midpoint.
    // This is robust at any scroll speed, since it only needs at
    // least one section to be partially visible at all, not a
    // specific ratio threshold to be crossed.
    var visibleSections = new Map();

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target, entry.boundingClientRect);
          } else {
            visibleSections.delete(entry.target);
          }
        });

        if (visibleSections.size === 0) return;

        var viewportMid = window.innerHeight / 2;
        var closestSection = null;
        var closestDistance = Infinity;

        visibleSections.forEach(function (rect, section) {
          var sectionMid = rect.top + rect.height / 2;
          var distance = Math.abs(sectionMid - viewportMid);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
          }
        });

        var match = spyEntries.find(function (e) {
          return e.section === closestSection;
        });
        if (match) setActiveLink(match.link);
      },
      {
        root: null,
        rootMargin: "0px",
        // Fine-grained thresholds so the callback fires often as
        // each section's visible ratio changes, at any scroll
        // speed — this is what catches slow, small-increment
        // scrolling that a single/sparse threshold can miss.
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
                    0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
      }
    );

    spyEntries.forEach(function (entry) {
      spyObserver.observe(entry.section);
    });
  }

  /* ══════════════════════════════════════════════════════════
     3. HERO-AWARE VISIBILITY
     ══════════════════════════════════════════════════════════
     nav.classList states used here (defined in CSS):
       .nav--top       → hero is the active section: fully
                         visible, opacity 1.
       .nav--faded     → outside hero, scrolling down: fully
                         invisible (opacity 0).
       .nav--revealed  → outside hero, scrolled up (even
                         slightly): fully visible again.
     The nav never repositions in any of these states — it's
     always pinned at translateY(0). Exactly one of these three
     classes is active at any time, and re-entering hero always
     forces .nav--top regardless of which of the other two was
     previously active.

     isHeroInView is set entirely by the scroll-spy above
     (setActiveLink), the instant it detects the active section
     has changed — there is no separate hero-only observer, so
     there is no possibility of the two systems disagreeing or
     drifting out of sync. This section only needs to listen for
     scroll events to evaluate the up/down check once outside
     hero.

     If no #hero section exists in the DOM at all, fall back to
     always-on faded/revealed behavior (no top-pinned state ever
     applies).
   */

  if (!hero) {
    isHeroInView = false;
  }

  // ── Nav background fade ──────────────────────────────────────
  // Independent of the hero-aware visibility state above: the nav
  // starts fully transparent, and once the page has scrolled past
  // a small threshold (roughly two mouse-wheel notches / a slight
  // swipe), .nav--scrolled fades the background color in over the
  // 0.4s transition defined in CSS. Scrolling back up past that
  // same threshold fades it back out. This runs alongside
  // applyPositionState() in the same scroll callback below, so no
  // extra scroll listener is added.
  var NAV_BG_THRESHOLD = 160; // px

  function updateNavBackground() {
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("nav--scrolled", scrollY > NAV_BG_THRESHOLD);
  }

  var scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        applyPositionState();
        updateNavBackground();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial state on load.
  applyPositionState();
  updateNavBackground();

  /* ══════════════════════════════════════════════════════════
     4. HAMBURGER + OVERLAY
     ══════════════════════════════════════════════════════════
     No special-case interaction with section 3 is needed here:
     while the menu is open, body scroll is locked, so no scroll
     event can fire — nav simply stays at whatever position it
     was already in, and normal hero/bottom-stick logic resumes
     automatically the instant the menu closes and scrolling
     becomes possible again.
   */

  if (hamburger && mobileNav && navOverlay) {
    var menuOpen = false;

    function setMenuState(open) {
      menuOpen = open;
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
      navOverlay.setAttribute("aria-hidden", open ? "false" : "true");
      hamburger.classList.toggle("hamburger--open", open);
      mobileNav.classList.toggle("mobile-nav--open", open);
      navOverlay.classList.toggle("nav-overlay--open", open);
      document.body.classList.toggle("no-scroll", open);
    }

    function openMenu()  { setMenuState(true); }
    function closeMenu() { setMenuState(false); }
    function toggleMenu() { setMenuState(!menuOpen); }

    hamburger.addEventListener("click", toggleMenu);
    navOverlay.addEventListener("click", closeMenu);

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) closeMenu();
    });

    var resizeTicking = false;
    window.addEventListener("resize", function () {
      if (resizeTicking) return;
      resizeTicking = true;
      window.requestAnimationFrame(function () {
        if (menuOpen && window.innerWidth > MOBILE_BREAKPOINT) {
          closeMenu();
        }
        resizeTicking = false;
      });
    });
  }
})();