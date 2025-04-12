document.addEventListener("DOMContentLoaded", () => {
  const elementsToAnimate = document.querySelectorAll(".animate-when-visible");

  // Configure the observer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.01,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        // Optional: Stop observing after animation is triggered
        // Uncomment if you want animations to happen only once
        // observer.unobserve(entry.target);
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  elementsToAnimate.forEach((element) => {
    observer.observe(element);
  });
});
