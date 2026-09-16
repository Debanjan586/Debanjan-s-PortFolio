// ============================================================
// PERFECT SEAMLESS MARQUEE — 3-SET LOOP
// ============================================================
//
// THREE identical sets: SET A | SET B | SET C
//
// The animation moves exactly one SET width (A's width).
// Because B immediately follows A, and C follows B, the
// track always has enough "runway" behind the visible area —
// even if a resize, font swap, or sub-pixel rounding happens
// mid-animation, there's a full extra set as buffer so you
// never see a gap or a snap.
//
// No CSS keyframes, no percentage-based transforms — everything
// is measured in real pixels via the Web Animations API, so the
// loop point is always mathematically exact for the current
// rendered width.
// ============================================================


const MARQUEE_DATA = [
  {
    id: "top",
    direction: "left",
    tags: [
      "Web Developer",
      "UI Designer",
      "Full Stack Engineer",
      "Performance Engineer",
      "Interface Designer",
      "Creative Developer",
      "Problem Solver"
    ]
  },
  {
    id: "bottom",
    direction: "right",
    tags: [
      "Web Developer",
      "UI Designer",
      "Full Stack Engineer",
      "Performance Engineer",
      "Interface Designer",
      "Creative Developer",
      "Problem Solver"
    ]
  }
];

const MARQUEE_SEPARATOR = "✦";

// Speed in pixels per second. Higher = faster.
const MARQUEE_SPEED = 25;

// How many identical sets to render per ribbon.
// 3 is the sweet spot: guarantees no visible gap even under
// resize/font-swap jitter, without tripling DOM cost like 4+ would.
const MARQUEE_SET_COUNT = 3;


// ============================================================
// CREATE ONE SET
// ============================================================

function createMarqueeSet(tags, hidden) {
  const set = document.createElement("div");
  set.className = "marquee-inner";

  if (hidden) {
    set.setAttribute("aria-hidden", "true");
  }

  tags.forEach(function (tag) {
    const tagElement = document.createElement("span");
    tagElement.className = "marquee-tag";
    tagElement.textContent = tag;
    set.appendChild(tagElement);

    const separatorElement = document.createElement("span");
    separatorElement.className = "marquee-sep";
    separatorElement.setAttribute("aria-hidden", "true");
    separatorElement.textContent = MARQUEE_SEPARATOR;
    set.appendChild(separatorElement);
  });

  return set;
}


// ============================================================
// INITIALIZE ONE RIBBON
// ============================================================

function initializeMarquee(ribbon) {
  const track = document.getElementById("marquee-track-" + ribbon.id);

  if (!track) {
    return;
  }

  // Remove previous content + any leftover animation.
  track.replaceChildren();
  track.style.animation = "none";
  track.style.animationName = "none";

  if (track._marqueeAnimation) {
    track._marqueeAnimation.cancel();
    track._marqueeAnimation = null;
  }

  // Build N identical sets. Only the first is visible to
  // screen readers; the rest are aria-hidden duplicates.
  const sets = [];
  for (let i = 0; i < MARQUEE_SET_COUNT; i++) {
    const set = createMarqueeSet(ribbon.tags, i !== 0);
    track.appendChild(set);
    sets.push(set);
  }

  // Wait for fonts AND layout to settle before measuring.
  // This is the fix for the "jump after a second" bug: if you
  // measure before the custom font finishes loading, the text
  // reflows to a different width right after the animation
  // starts, causing a visible snap. document.fonts.ready
  // resolves only once all @font-face fonts are fully loaded.
  const waitForFonts =
    document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

  waitForFonts.then(function () {
    // Double rAF: one to let any font-triggered reflow commit,
    // one more to read the final, stable layout.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        startMarquee(track, sets[0], ribbon.direction);
      });
    });
  });
}


// ============================================================
// START MARQUEE
// ============================================================

function startMarquee(track, setA, direction) {
  // Measure ONLY the first set — that's the exact distance
  // needed for one full, seamless loop cycle.
  const distance = setA.getBoundingClientRect().width;

  if (!distance || distance <= 0) {
    return;
  }

  const duration = (distance / MARQUEE_SPEED) * 1000;

  if (track._marqueeAnimation) {
    track._marqueeAnimation.cancel();
  }

  if (direction === "left") {
    track.style.transform = "translate3d(0, 0, 0)";

    track._marqueeAnimation = track.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: "translate3d(-" + distance + "px, 0, 0)" }
      ],
      {
        duration: duration,
        iterations: Infinity,
        easing: "linear"
      }
    );

    return;
  }

  if (direction === "right") {
    track.style.transform = "translate3d(-" + distance + "px, 0, 0)";

    track._marqueeAnimation = track.animate(
      [
        { transform: "translate3d(-" + distance + "px, 0, 0)" },
        { transform: "translate3d(0, 0, 0)" }
      ],
      {
        duration: duration,
        iterations: Infinity,
        easing: "linear"
      }
    );
  }
}


// ============================================================
// INITIALIZE ALL RIBBONS
// ============================================================

function initializeAllMarquees() {
  MARQUEE_DATA.forEach(function (ribbon) {
    initializeMarquee(ribbon);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAllMarquees);
} else {
  initializeAllMarquees();
}


// ============================================================
// HANDLE RESPONSIVE WIDTH CHANGES
// ============================================================

let marqueeResizeTimer;

window.addEventListener("resize", function () {
  clearTimeout(marqueeResizeTimer);
  marqueeResizeTimer = setTimeout(function () {
    initializeAllMarquees();
  }, 150);
});