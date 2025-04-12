import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./testimonials-carousel.css";

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

const TestimonialSlide = React.memo(
  ({
    testimonial,
    isVisible,
  }: {
    testimonial: Testimonial;
    isVisible: boolean;
  }) => (
    <div className={`testimonial-slide ${isVisible ? "slide-visible" : ""}`}>
      <div className="testimonial-card gpu-accelerated">
        <div className="testimonial-accent"></div>
        <div className="testimonial-quote">
          <FaQuoteLeft className="quote-icon" />
        </div>
        <p className="testimonial-content">{testimonial.content}</p>
        <div className="testimonial-author-container">
          <div className="testimonial-author-avatar">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="testimonial-author-image"
              loading="lazy"
            />
          </div>
          <div className="testimonial-author-details">
            <h4 className="testimonial-author-name">{testimonial.name}</h4>
            <p className="testimonial-author-role">{testimonial.role}</p>
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    dragFree: false,
    containScroll: "trimSnaps",
    draggable: true,
    dragThreshold: 5,
    duration: 30,
    direction: "ltr",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Handle selection changes
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Touch performance optimization
  useEffect(() => {
    if (!emblaApi) return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      const handlePointerDown = () => {
        document.documentElement.style.setProperty(
          "--testimonial-duration-normal",
          "0ms",
        );
        containerRef.current?.classList.add("touch-dragging");
      };
      const handlePointerUp = () => {
        setTimeout(() => {
          document.documentElement.style.setProperty(
            "--testimonial-duration-normal",
            "400ms",
          );
          containerRef.current?.classList.remove("touch-dragging");
        }, 100);
      };

      emblaApi.on("pointerDown", handlePointerDown);
      emblaApi.on("pointerUp", handlePointerUp);

      return () => {
        emblaApi.off("pointerDown", handlePointerDown);
        emblaApi.off("pointerUp", handlePointerUp);
      };
    }
  }, [emblaApi]);

  return (
    <div className="testimonial-section" ref={containerRef}>
      <h2 className="text-4xl md:text-5xl font-doto font-bold mb-4 text-center testimonial-heading">
        <span className="text-[oklch(var(--accent-title))]">Client</span>{" "}
        Testimonials
      </h2>
      <p className="text-foreground-muted text-center max-w-2xl mx-auto mb-16 testimonial-description">
        Don't just take my word for it - here's what clients have to say about
        working with me.
      </p>

      <div className="testimonial-carousel-container">
        <div className="testimonial-carousel-viewport" ref={emblaRef}>
          <div className="testimonial-carousel-slides gpu-accelerated">
            {testimonials.map((t) => (
              <TestimonialSlide
                key={t.id}
                testimonial={t}
                isVisible={selectedIndex === testimonials.indexOf(t)}
              />
            ))}
          </div>
        </div>

        <div className="testimonial-navigation">
          <button
            className="testimonial-button testimonial-prev-button"
            onClick={scrollPrev}
            aria-label="Previous testimonial"
          >
            <MdChevronLeft className="testimonial-button-icon" />
          </button>
          <button
            className="testimonial-button testimonial-next-button"
            onClick={scrollNext}
            aria-label="Next testimonial"
          >
            <MdChevronRight className="testimonial-button-icon" />
          </button>
        </div>
      </div>

      <div className="testimonial-pagination">
        {emblaApi
          ?.scrollSnapList()
          .map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${
                i === selectedIndex
                  ? "testimonial-dot-active"
                  : "testimonial-dot-inactive"
              }`}
              onClick={() => scrollTo(i)}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
