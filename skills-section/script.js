gsap.registerPlugin(ScrollTrigger);

let skillsHeading = document.querySelector("#skills .heading");
let skillsImages  = gsap.utils.toArray(".skills-overflow-div img");
let skillsText    = document.querySelector("#skills p");

gsap.set(skillsHeading, { opacity: 0, y: 30 });
gsap.set(skillsImages,  { opacity: 0, y: 40 });
gsap.set(skillsText,    { opacity: 0, y: 20 });

ScrollTrigger.create({
  trigger: skillsHeading,
  start: "top 80%",
  once: true,
  onEnter: function () {
    gsap.to(skillsHeading, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  },
});

ScrollTrigger.create({
  trigger: skillsImages[0],
  start: "top 80%",
  once: true,
  onEnter: function () {
    gsap.to(skillsImages, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out", stagger: 0.05 });
  },
});

ScrollTrigger.create({
  trigger: skillsText,
  start: "top 80%",
  once: true,
  onEnter: function () {
    gsap.to(skillsText, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
  },
});

ScrollTrigger.refresh();