gsap.registerPlugin(ScrollTrigger);

let aboutHeading = document.querySelector("#about-me .heading");

gsap.set(aboutHeading, { opacity: 0, y: 30 });

ScrollTrigger.create({
  trigger: aboutHeading,
  start: "top 80%",
  once: true,
  onEnter: function () {
    gsap.to(aboutHeading, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  },
});

ScrollTrigger.refresh();