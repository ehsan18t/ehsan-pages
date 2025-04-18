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
      <div className="testimonial-card gpu-accelerated gap-6">
        <div className="testimonial-accent"></div>
        <FaQuoteLeft className="quote-icon" />
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
    containScroll: "trimSnaps",
    skipSnaps: true,
    duration: 15,
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

  return (
    <div className="testimonial-section" ref={containerRef}>
      <h2 className="font-doto mb-4 text-center text-4xl font-bold md:text-5xl">
        <span className="text-accent-title">Client</span> Testimonials
      </h2>
      <p className="text-foreground-muted mx-auto mb-16 max-w-2xl text-center">
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

        <div className="pointer-events-none absolute inset-0 z-10">
          <MdChevronLeft
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="bg-accent-bg/10 text-accent-text border-accent-text/15 hover:bg-accent-bg/20 pointer-events-auto absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border opacity-70 backdrop-blur-md transition-all hover:scale-105 hover:opacity-100 hover:shadow-[0_0_15px_oklch(var(--accent-text)/0.3)] sm:h-12 sm:w-12"
          />
          <MdChevronRight
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="bg-accent-bg/10 text-accent-text border-accent-text/15 hover:bg-accent-bg/20 pointer-events-auto absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border opacity-70 backdrop-blur-md transition-all hover:scale-105 hover:opacity-100 hover:shadow-[0_0_15px_oklch(var(--accent-text)/0.3)] sm:h-12 sm:w-12"
          />
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
