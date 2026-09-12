const DEV_MODE = false;  // flip to true to skip the loader animation during testing

(function () {

  let loader     = document.getElementById("loader");
  let panelLeft  = document.querySelector(".loader-panel--left");
  let panelRight = document.querySelector(".loader-panel--right");
  let wordEl     = document.getElementById("loader-word");
  let loaderRule = document.querySelector(".loader-rule");
  let ruleFill   = document.querySelector(".loader-rule-fill");
  let tagEl      = document.querySelector(".loader-tag");
  let mainStack  = document.querySelector(".original-main-stack");

  if (!loader) return;

  if (DEV_MODE) {
    loader.style.display = "none";
    window.revealHero();
    return;
  }

  // ── Build the wordmark out of individual letter spans ────────
  var WORD = "DEBANJAN";
  wordEl.innerHTML = WORD.split("")
    .map(function (ch) { return '<span class="lw-char">' + ch + "</span>"; })
    .join("");

  var chars = wordEl.querySelectorAll(".lw-char");

  // ── Initial states ────────────────────────────────────────────
  gsap.set(mainStack, { scale: 0.6, transformOrigin: "center center" });
  gsap.set([panelLeft, panelRight], { x: 0 });
  gsap.set(chars, { y: "115%", opacity: 0 });
  gsap.set(loaderRule, { opacity: 0 });
  gsap.set(ruleFill, { width: "0%", opacity: 1 });
  gsap.set(tagEl, { opacity: 0, y: 8 });

  document.body.style.overflow = "hidden";

  // ── Main timeline ─────────────────────────────────────────────
  var tl = gsap.timeline();

  // Letters rise into place, one after another
  tl.to(chars, {
    y: "0%",
    opacity: 1,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.045,
  });

  tl.addLabel("wordIn");

  tl.to(loaderRule, {
    opacity: 1,
    duration: 0.2,
    ease: "power2.inOut",
  }, "wordIn-=0.15");

  // The rule draws itself in and arrives centred under the wordmark
  tl.to(ruleFill, {
    width: "100%",
    duration: 0.9,
    ease: "power2.inOut",
  }, "wordIn-=0.15");

  // Tagline settles in alongside the rule's arrival, timed off its own label
  // so it stays put no matter how the rule's travel/exit timing changes
  tl.to(tagEl, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
  }, "wordIn+=0.25");

  // Hold here — this is the "stay at the middle" beat, giving the fill
  // a clear moment fully centred before it continues on
  tl.to({}, { duration: 0.35 });

  // Continues travelling right past centre, fading out as it goes —
  // this is the single motion that reads as "goes right and fades out"
  tl.to(ruleFill, {
    width: "200%",
    opacity: 0,
    duration: 0.9,
    ease: "power2.inOut",
  });

  // Hold, so the mark actually gets a moment to be read
  tl.to({}, { duration: 0.4 });

  // Everything else eases away together (ruleFill already faded itself out above)
  tl.to([wordEl, tagEl, loaderRule], {
    opacity: 0,
    y: 0,
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