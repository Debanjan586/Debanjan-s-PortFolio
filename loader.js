 const DEV_MODE = false;  //i made this because i wanted to skip the loader animation and go straight to the hero section for testing purposes.

(function () {

  let loader     = document.getElementById("loader");
  let panelLeft  = document.querySelector(".loader-panel--left");
  let panelRight = document.querySelector(".loader-panel--right");
  let ll1        = document.getElementById("ll-1");
  let ll2        = document.getElementById("ll-2");
  let ll3        = document.getElementById("ll-3");
  let hero       = document.querySelector(".hero");

  if (DEV_MODE) {
    loader.style.display = "none";
    window.revealHero();
    return;
  }

  gsap.set(document.querySelector(".original-main-stack"), { scale: 0.6, transformOrigin: "center center" });
  gsap.set([ll1, ll2, ll3], { opacity: 0, y: 14 });
  gsap.set([panelLeft, panelRight], { x: 0 });

  document.body.style.overflow = "hidden";

  let tl = gsap.timeline();

  tl.to(ll1, { opacity: 1, y: 0, duration: 0.6, ease: "power2.inOut" });
  tl.to({}, { duration: 1.0 });
  tl.to(ll1, { opacity: 0,        duration: 0.5, ease: "power2.inOut" });
  tl.to({}, { duration: 0.2 });

  tl.to(ll2, { opacity: 1, y: 0, duration: 0.6, ease: "power2.inOut" });
  tl.to({}, { duration: 1.0 });
  tl.to(ll2, { opacity: 0,        duration: 0.5, ease: "power2.inOut" });
  tl.to({}, { duration: 0.2 });

  tl.to(ll3, { opacity: 1, y: 0, duration: 0.6, ease: "power2.inOut" });
  tl.to({}, { duration: 1.2 });
  tl.to(ll3, { opacity: 0,        duration: 0.5, ease: "power2.inOut" });
  tl.to({}, { duration: 0.1 });

  tl.to(panelLeft,  { x: "-100vw", duration: 0.9, ease: "power4.inOut" });
  tl.to(panelRight, { x: "100vw",  duration: 0.9, ease: "power4.inOut" }, "<");
  tl.to(document.querySelector(".original-main-stack"), { scale: 1, duration: 0.9, ease: "power3.out" }, "<");

  tl.call(function () {
    loader.remove();
    document.body.style.overflow = "";
    window.revealHero();
  });

}());
