(function () {
  var fill = document.getElementById("top-scroll-progress-fill");
  if (!fill) return;

  var target  = 0;   // where the scroll actually is (0-100)
  var current = 0;   // where the bar is currently drawn (0-100)
  var ease    = 0.12; // lower = smoother/slower catch-up

  function computeTarget() {
    var scrollTop  = window.scrollY || document.documentElement.scrollTop;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    target = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }

  function tick() {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.05) current = target;
    fill.style.width = current + "%";
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", computeTarget, { passive: true });
  window.addEventListener("resize", computeTarget);
  computeTarget();
  current = target; // avoid an initial "grow-in" animation on load
  requestAnimationFrame(tick);
}());