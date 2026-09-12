/* ══════════════════════════════════════════════════════════════
   MUSIC CONTROL — fully isolated module.
   Does NOT touch loader.js or script.js.
   Uses the single existing <audio id="bg-audio"> element in the DOM.
   ══════════════════════════════════════════════════════════════ */

(function () {
  var btn   = document.getElementById("sound-toggle");
  var audio = document.getElementById("bg-audio");

  if (!btn || !audio) return;

  var MAX_VOLUME = 1;   // comfortable, moderate max volume
  var FADE_MS     = 1520;   // short, elegant fade

  // The single source of truth for what the user *wants* right now.
  var targetPlaying = false;

  // Guards the fade animation loop only — NOT clicks. Clicks are always
  // accepted immediately, so the button never feels unresponsive.
  var fadeHandle = null;
  var fadeToken  = 0; // increments on every new fade request, invalidating old ones

  audio.volume = 0;

  function setUI(playing) {
    btn.classList.toggle("is-playing", playing);
    var label = playing ? "Pause sound" : "Play sound";
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }

  function cancelFade() {
    if (fadeHandle !== null) {
      cancelAnimationFrame(fadeHandle);
      fadeHandle = null;
    }
  }

  // Fades volume toward `target`. Non-blocking: callers do NOT await this,
  // so a click is never stuck waiting behind a fade in progress.
  function fadeVolumeTo(target, duration, onDone) {
    cancelFade();
    var myToken = ++fadeToken;
    var start = performance.now();
    var from  = audio.volume;

    if (Math.abs(from - target) < 0.001) {
      audio.volume = Math.min(1, Math.max(0, target));
      if (onDone) onDone();
      return;
    }

    function step(now) {
      // If a newer fade request has come in, abandon this one silently.
      if (myToken !== fadeToken) return;
      var t = Math.min(1, (now - start) / duration);
      var v = from + (target - from) * t;
      audio.volume = Math.min(1, Math.max(0, v));
      if (t < 1) {
        fadeHandle = requestAnimationFrame(step);
      } else {
        fadeHandle = null;
        if (onDone) onDone();
      }
    }

    fadeHandle = requestAnimationFrame(step);
  }

  // Applies whatever the user most recently asked for. Always runs
  // synchronously up front (UI + play/pause call), then lets the volume
  // fade animate in the background — so it never blocks the next click.
  function applyTarget() {
    var desired = targetPlaying;
    fadeToken++; // invalidate any in-flight fade immediately

    if (desired) {
      setUI(true);
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Autoplay / playback restriction or other failure — fail safe.
          // Only revert if the user hasn't already changed their mind again.
          if (targetPlaying) {
            targetPlaying = false;
            setUI(false);
            audio.volume = 0;
          }
        });
      }
      fadeVolumeTo(MAX_VOLUME, FADE_MS);
    } else {
      setUI(false);
      fadeVolumeTo(0, FADE_MS, function () {
        // Only pause if the user hasn't clicked play again since.
        if (!targetPlaying) audio.pause();
      });
    }
  }

  btn.addEventListener("click", function () {
    targetPlaying = !targetPlaying;
    applyTarget();
  });

  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      // native <button> already handles activation; nothing extra needed,
      // this just prevents page scroll on Space in older browsers.
      e.preventDefault();
      btn.click();
    }
  });

  audio.addEventListener("ended", function () {
    // Natural end of track: return to OFF state gracefully.
    targetPlaying = false;
    cancelFade();
    audio.volume = 0;
    setUI(false);
  });
})();