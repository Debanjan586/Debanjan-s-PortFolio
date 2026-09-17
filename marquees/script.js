// ============================================================
// SIMPLE MARQUEE — NO RESIZE LOGIC, NO MEASURING, NO JS TIMING
// ============================================================
//
// The old approach measured pixel widths in JS and re-timed a
// WAAPI animation whenever the window resized. That's the whole
// class of problem removed here: this version renders the tags
// enough times to comfortably overflow any real screen width,
// and hands ALL motion to a single, fixed-duration CSS animation
// that moves the track by -50% of its own total width forever.
//
// Since it's a plain CSS keyframe animation (not JS-driven), the
// browser keeps it perfectly smooth through any resize, zoom, or
// fullscreen change on its own — there is nothing to recalculate,
// nothing to listen for, and nothing that can desync or jump.
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

// How many times to repeat the full tag list per half of the
// track. Two halves (each repeated this many times) sit back to
// back so the track can loop at exactly -50%. A high repeat count
// guarantees the content is always wider than any realistic
// screen, at any zoom level, without ever measuring anything in JS.
const MARQUEE_REPEATS = 6;


function buildTagGroup(tags, hidden) {
  const group = document.createElement("div");
  group.className = "marquee-inner";

  if (hidden) {
    group.setAttribute("aria-hidden", "true");
  }

  tags.forEach(function (tag) {
    const tagElement = document.createElement("span");
    tagElement.className = "marquee-tag";
    tagElement.textContent = tag;
    group.appendChild(tagElement);

    const sep = document.createElement("span");
    sep.className = "marquee-sep";
    sep.setAttribute("aria-hidden", "true");
    sep.textContent = MARQUEE_SEPARATOR;
    group.appendChild(sep);
  });

  return group;
}

function buildHalf(tags, hidden) {
  // One "half" of the track: the tag list repeated MARQUEE_REPEATS
  // times back to back, wrapped in a single element. Two of these
  // halves (identical content) placed side by side let the track
  // loop seamlessly at exactly -50% with zero gap or measurement.
  const half = document.createElement("div");
  half.className = "marquee-half";
  if (hidden) {
    half.setAttribute("aria-hidden", "true");
  }
  for (let i = 0; i < MARQUEE_REPEATS; i++) {
    half.appendChild(buildTagGroup(tags, hidden || i !== 0));
  }
  return half;
}

function initializeMarquee(ribbon) {
  const track = document.getElementById("marquee-track-" + ribbon.id);
  if (!track) {
    return;
  }

  track.replaceChildren();
  track.classList.add(
    "marquee-track--" + (ribbon.direction === "right" ? "right" : "left")
  );

  // Two identical halves back to back — the CSS animation moves
  // by exactly -50%, so the moment half A scrolls fully out, half
  // B is already sitting in the exact same spot half A started in.
  track.appendChild(buildHalf(ribbon.tags, false));
  track.appendChild(buildHalf(ribbon.tags, true));
}

function initializeAllMarquees() {
  MARQUEE_DATA.forEach(initializeMarquee);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAllMarquees);
} else {
  initializeAllMarquees();
}

// No resize listener. No width measuring. No re-timing. The CSS
// animation in style.css handles looping entirely on its own.