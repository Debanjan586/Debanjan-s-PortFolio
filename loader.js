const DEV_MODE = true;  // flip to true to skip the loader animation during testing

(function () {

  let loader     = document.getElementById("loader");
  let panelLeft  = document.querySelector(".loader-panel--left");
  let panelRight = document.querySelector(".loader-panel--right");
  let wordEl     = document.getElementById("loader-word");
  let mainStack  = document.querySelector(".original-main-stack");

  if (!loader) return;

  if (DEV_MODE) {
    loader.style.display = "none";
    window.revealHero();
    return;
  }

  // ============================================================
  // WORD SETUP
  // ============================================================
  //
  // Sequence:
  //   1) "D" appears alone
  //   2) "ebanjan" glides IN FROM THE RIGHT and docks right after
  //      the "D" -> together they read as "Debanjan"
  //   3) "Debanjan" letter-morphs into "Developer":
  //        - letters shared between both words (matched left-to-right,
  //          each source letter used at most once) slide into their
  //          new position instead of fading
  //        - letters only in "Debanjan" fade + shrink away
  //        - letters only in "Developer" fade + grow in, in place
  //   4) panels split apart, hero zooms in — untouched from before
  //
  // LAYOUT FIX (why the glide direction looked broken before):
  // #loader-word is `display: inline-flex` in the stylesheet. Mixing
  // flex-flowed children with absolutely-positioned ones in the same
  // box makes offset math unreliable — some letters get positioned
  // relative to the flex box, others relative to the nearest
  // positioned ancestor, and small x-nudges get lost in the noise.
  // Fixed here by overriding wordEl to position:relative/display:block
  // via inline style, and making EVERY letter — old and new — position:
  // absolute from the very first frame, each pre-measured against a
  // hidden "rig" that mirrors the real font/spacing. That gives one
  // single, stable coordinate space, so every x/y GSAP sets is an
  // exact, jump-free glide.
  // ============================================================

  var WORD_A = "Debanjan";
  var WORD_B = "Developer";

  // ---- greedy left-to-right letter match (case-insensitive) ----
  // matchA[i] = index in WORD_B that WORD_A[i] maps to, or -1 if unmatched.
  function matchLetters(a, b) {
    var bChars = b.toLowerCase().split("");
    var used = bChars.map(function () { return false; });
    var matchA = a.split("").map(function () { return -1; });

    for (var i = 0; i < a.length; i++) {
      var ch = a[i].toLowerCase();
      for (var j = 0; j < bChars.length; j++) {
        if (!used[j] && bChars[j] === ch) {
          used[j] = true;
          matchA[i] = j;
          break;
        }
      }
    }
    return { matchA: matchA, usedB: used };
  }

  var matchResult = matchLetters(WORD_A, WORD_B);
  var matchA = matchResult.matchA;
  var usedB  = matchResult.usedB;

  // ---- lock down the container's box so absolute children behave ----
  var wordElStyles = window.getComputedStyle(wordEl);
  var originalHeight = wordEl.getBoundingClientRect().height;

  wordEl.innerHTML = "";
  wordEl.style.position   = "relative";
  wordEl.style.display    = "block";
  wordEl.style.whiteSpace = "nowrap";

  // ---- off-DOM measuring rig using the exact same font/spacing as the
  //      real word, so offsetLeft values are accurate for BOTH
  //      "Debanjan" (natural layout) and "Developer" (target layout) ----
  var rig = document.createElement("span");
  rig.style.position      = "absolute";
  rig.style.visibility    = "hidden";
  rig.style.left          = "0";
  rig.style.top           = "0";
  rig.style.display       = "inline-flex"; // matches .loader-word's own display
  rig.style.font          = wordElStyles.font;
  rig.style.letterSpacing = wordElStyles.letterSpacing;
  wordEl.parentNode.appendChild(rig);

  function measureOffsets(word) {
    rig.innerHTML = "";
    var spans = word.split("").map(function (ch) {
      var s = document.createElement("span");
      s.style.display = "inline-block";
      s.style.whiteSpace = "pre";
      s.textContent = ch;
      rig.appendChild(s);
      return s;
    });
    return spans.map(function (s) { return s.offsetLeft; });
  }

  var aOffsets = measureOffsets(WORD_A); // natural "Debanjan" positions
  var bOffsets = measureOffsets(WORD_B); // natural "Developer" positions

  wordEl.parentNode.removeChild(rig);

  // ---- build the real letters, each absolutely positioned at its
  //      natural "Debanjan" slot from aOffsets ----
  var spansA = WORD_A.split("").map(function (ch, i) {
    var span = document.createElement("span");
    span.className = "lw-char";
    span.textContent = ch;
    span.style.position  = "absolute";
    span.style.left      = aOffsets[i] + "px";
    span.style.top       = "0";
    span.style.transform = "none"; // neutralize the CSS translateY(115%) baseline
    wordEl.appendChild(span);
    return span;
  });

  var dChar     = spansA[0];        // "D"
  var restChars = spansA.slice(1);  // "ebanjan"

  // ---- create WORD_B-only letters now, hidden, pre-positioned at
  //      their final "Developer" slot ----
  var newLetterSpans = []; // parallel to WORD_B indices; null where a
                            // matched WORD_A letter already fills that slot
  for (var k = 0; k < WORD_B.length; k++) {
    if (usedB[k]) {
      newLetterSpans.push(null);
      continue;
    }
    var ns = document.createElement("span");
    ns.className = "lw-char lw-char--incoming";
    ns.textContent = WORD_B[k];
    ns.style.position  = "absolute";
    ns.style.left      = bOffsets[k] + "px";
    ns.style.top       = "0";
    ns.style.transform = "none";
    wordEl.appendChild(ns);
    newLetterSpans.push(ns);
  }

  // Give the container an explicit height/width so it doesn't
  // collapse now that every child is position: absolute.
  var lastIdxA = aOffsets.length - 1;
  var totalWidthA = aOffsets[lastIdxA] +
    (spansA[lastIdxA].getBoundingClientRect().width || 0);
  wordEl.style.minHeight = (originalHeight || 60) + "px";
  wordEl.style.minWidth  = Math.max(totalWidthA, 10) + "px";

  // ============================================================
  // INITIAL STATES
  // ============================================================

  gsap.set(mainStack, { scale: 0.6, transformOrigin: "center center" });
  gsap.set([panelLeft, panelRight], { x: 0 });

  // "D" starts in place, invisible.
  gsap.set(dChar, { opacity: 0, x: 0, y: 0 });

  // "ebanjan" starts OFF TO THE RIGHT by a real, visible distance
  // (well past its own natural slot) and glides LEFT into its
  // natural "Debanjan" position — this reads as sliding IN FROM
  // THE RIGHT, docking next to the "D".
  var GLIDE_DISTANCE = 90; // px — tune to taste
  gsap.set(restChars, { opacity: 0, x: GLIDE_DISTANCE, y: 0 });

  gsap.set(newLetterSpans.filter(Boolean), { opacity: 0, scale: 0.4 });

  document.body.style.overflow = "hidden";

  // ============================================================
  // MAIN TIMELINE
  // ============================================================

  var tl = gsap.timeline();

  // 1) "D" appears alone
  tl.to(dChar, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
  });

  tl.addLabel("dIn");

  // brief beat holding just "D" before the rest glides in
  tl.to({}, { duration: 0.25 });

  // 2) "ebanjan" glides IN FROM THE RIGHT and docks next to "D"
  tl.to(restChars, {
    x: 0,
    opacity: 1,
    duration: 0.65,
    ease: "power3.out",
    stagger: 0.035,
  });

  tl.addLabel("wordIn");

  // hold so "Debanjan" is actually readable before it morphs
  tl.to({}, { duration: 0.55 });

  tl.addLabel("morphStart");

  // 3) letter-morph "Debanjan" -> "Developer"
  //    a) matched letters slide from their "Debanjan" slot to their
  //       "Developer" slot (both are real, pre-measured offsets, so
  //       this is an exact, jump-free glide)
  spansA.forEach(function (span, i) {
    var targetB = matchA[i];
    if (targetB === -1) return; // handled in (b) below
    tl.to(span, {
      x: bOffsets[targetB] - aOffsets[i],
      duration: 0.55,
      ease: "power2.inOut",
    }, "morphStart");
  });

  //    b) unmatched "Debanjan" letters fade + shrink away
  var removedSpans = spansA.filter(function (span, i) {
    return matchA[i] === -1;
  });
  if (removedSpans.length) {
    tl.to(removedSpans, {
      opacity: 0,
      scale: 0.4,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.02,
    }, "morphStart");
  }

  //    c) new "Developer"-only letters fade + grow in, in place
  var incoming = newLetterSpans.filter(Boolean);
  if (incoming.length) {
    tl.to(incoming, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "back.out(1.6)",
      stagger: 0.03,
    }, "morphStart+=0.15");
  }

  tl.addLabel("morphDone", "morphStart+=0.75");

  // brief hold so "Developer" gets read before the handoff
  tl.to({}, { duration: 0.5 }, "morphDone");

  // 4) everything eases away together
  tl.to(wordEl, {
    opacity: 0,
    duration: 0.4,
    ease: "power3.out",
  });

  // ── Panel split + hero scale-in — same handoff feel as before ──
  tl.to(panelLeft,  { x: "-100vw", duration: 0.9, ease: "power4.inOut" }, "-=0.05");
  tl.to(panelRight, { x: "100vw",  duration: 0.9, ease: "power4.inOut" }, "<");
  tl.to(mainStack,  { scale: 1, duration: 0.6, ease: "power3.out" }, "<");

  // ── Handoff — identical contract to before: script.js is untouched ──
  tl.call(function () {
    loader.remove();
    document.body.style.overflow = "";
    window.revealHero();
  });

}());