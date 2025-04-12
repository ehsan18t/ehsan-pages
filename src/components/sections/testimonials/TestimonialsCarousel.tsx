import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface Testimonial {
  id: number;
  content: string;
  name: string;
  role: string;
  image: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const AUTOPLAY_INTERVAL = 5000;

const TestimonialSlide = React.memo(
  ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="flex-[0_0_100%] min-w-0 px-4 md:px-8 will-change-transform">
      <div className="bg-gradient-to-br from-[oklch(var(--accent-bg)/0.08)] to-[oklch(var(--accent-bg)/0.03)] backdrop-blur-md border border-[oklch(var(--accent-bg)/0.15)] rounded-2xl p-8 shadow-lg min-h-[350px] flex flex-col relative overflow-hidden select-none transform-gpu">
        {/* Top accent border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[oklch(var(--accent-text)/0.7)] to-[oklch(var(--accent-title))] rounded-t-md"></div>

        {/* Quote icon */}
        <div className="mb-6">
          <FaQuoteLeft className="text-[oklch(var(--accent-text))] w-12 h-12 opacity-80" />
        </div>

        {/* Testimonial content */}
        <p className="text-foreground text-lg leading-relaxed text-justify flex-grow">
          {testimonial.content}
        </p>

        {/* Author info */}
        <div className="flex items-center mt-auto pt-5 border-t border-[oklch(var(--accent-bg)/0.15)]">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[oklch(var(--accent-text)/0.3)] shadow-md mr-4 bg-gradient-to-br from-[oklch(var(--accent-bg)/0.2)] to-transparent">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h4 className="font-bold text-lg">{testimonial.name}</h4>
            <p className="text-foreground-muted text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  ),
);

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Fixed options with correct properties
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
    dragThreshold: 20,
    duration: 15, // Using correct property 'duration' instead of 'speed'
    inViewThreshold: 0.3, // Improves touch performance
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [autoplayActive, setAutoplayActive] = useState(false);

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Simple autoplay setup
  useEffect(() => {
    if (!emblaApi || !autoplayActive) return;

    const intervalId = setInterval(scrollNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(intervalId);
  }, [emblaApi, autoplayActive, scrollNext]);

  // Intersection Observer for animations and autoplay
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isInView = entries[0].isIntersecting;

        if (containerRef.current) {
          if (isInView) {
            setAutoplayActive(true);
          } else {
            setAutoplayActive(false);
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Set up embla carousel with reinitialization for reliability
  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);

    // Proper initialization sequence for better performance
    const timer = setTimeout(() => {
      emblaApi.reInit();
      // Additional initialization for touch performance
      if ("ontouchstart" in window) {
        emblaApi.on("pointerDown", () => {
          // Improves touch response by removing transitions on touch
          const slides = document.querySelectorAll(".flex-[0_0_100%]");
          slides.forEach((slide) => {
            slide.classList.add("touch-action-pan-y");
          });
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative max-w-6xl w-full mx-auto pb-12" ref={containerRef}>
      <h2 className="text-4xl md:text-5xl font-doto font-bold mb-4 text-center">
        <span className="text-[oklch(var(--accent-title))]">Client</span>{" "}
        Testimonials
      </h2>
      <p className="text-foreground-muted text-center max-w-2xl mx-auto mb-16">
        Don't just take my word for it - here's what clients have to say about
        working with me.
      </p>

      {/* Improved carousel wrapper with better touch behavior */}
      <div className="px-0 relative touch-pan-y">
        {/* Carousel with GPU acceleration */}
        <div className="overflow-hidden will-change-transform" ref={emblaRef}>
          <div className="flex transform-gpu will-change-transform touch-pan-y">
            {testimonials?.map((testimonial) => (
              <TestimonialSlide
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>

        {/* Simplified navigation arrows for better touch response */}
        <div className="navigation-container absolute inset-0 pointer-events-none">
          <button
            className="pointer-events-auto  cursor-pointer absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[oklch(var(--accent-bg)/0.1)] text-[oklch(var(--accent-text))] backdrop-blur-md border border-[oklch(var(--accent-text)/0.15)] opacity-70 transition-all hover:opacity-100 hover:bg-[oklch(var(--accent-bg)/0.2)] hover:scale-105 hover:shadow-[0_0_15px_oklch(var(--accent-text)/0.3)] transform-gpu"
            onClick={scrollPrev}
            aria-label="Previous testimonial"
          >
            <MdChevronLeft className="w-7 h-7" />
          </button>

          <button
            className="pointer-events-auto cursor-pointer absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[oklch(var(--accent-bg)/0.1)] text-[oklch(var(--accent-text))] backdrop-blur-md border border-[oklch(var(--accent-text)/0.15)] opacity-70 transition-all hover:opacity-100 hover:bg-[oklch(var(--accent-bg)/0.2)] hover:scale-105 hover:shadow-[0_0_15px_oklch(var(--accent-text)/0.3)] transform-gpu"
            onClick={scrollNext}
            aria-label="Next testimonial"
          >
            <MdChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Streamlined dot navigation */}
      <div className="flex justify-center mt-8 space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transform-gpu ${
              index === selectedIndex
                ? "w-8 bg-[oklch(var(--accent-text))]"
                : "w-3 bg-[oklch(var(--accent-text)/0.3)]"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
