export default function initObservation() {
  const elementsToAnimate = document.querySelectorAll(".animate-when-visible");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.01,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        // Stop observing after animation is triggered
        // for "animate-once" elements
        if (entry.target.classList.contains("animate-once")) {
          observer.unobserve(entry.target);
        }
      } else if (!entry.target.classList.contains("animate-once")) {
        // Only remove the class if it's not an "animate-once" element
        entry.target.classList.remove("is-visible");
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  elementsToAnimate.forEach((element) => {
    observer.observe(element);
  });
}
