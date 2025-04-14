import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight, MdFullscreen } from "react-icons/md";
import "./image-slider.css";

type ImageSliderProps = {
  images: string[];
  title: string;
  imageLayout?: "cover" | "contain";
  autoplay?: boolean;
  autoplayInterval?: number;
};

// Simple lightbox implementation
function Lightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Navigation without transitioning state
  const prevImage = useCallback(() => {
    if (!imageContainerRef.current) return;

    // Set direction via data attribute instead of state
    imageContainerRef.current.dataset.direction = "prev";
    imageContainerRef.current.classList.remove("transitioning");
    // Force reflow to ensure animation restart
    void imageContainerRef.current.offsetWidth;
    imageContainerRef.current.classList.add("transitioning");

    // Update index after transition completes
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    if (!imageContainerRef.current) return;

    // Set direction via data attribute instead of state
    imageContainerRef.current.dataset.direction = "next";
    imageContainerRef.current.classList.remove("transitioning");
    // Force reflow to ensure animation restart
    void imageContainerRef.current.offsetWidth;
    imageContainerRef.current.classList.add("transitioning");

    // Update index after transition completes
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, prevImage, nextImage]);

  // Update index when initialIndex changes without animation
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="slider-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="slider-lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={imageContainerRef}
          className="slider-lightbox-image-container"
          data-direction="next"
        >
          <img
            key={`lightbox-image-${currentIndex}`}
            src={images[currentIndex]}
            alt={`${title} - image ${currentIndex + 1}`}
            className="slider-lightbox-image animate-zoom-in fill-forwards"
            loading="eager"
          />
        </div>

        <button
          className="slider-lightbox-close animate-fade-in fill-forwards"
          onClick={onClose}
          aria-label="Close fullscreen view"
        >
          <FaTimes />
        </button>

        {images.length > 1 && (
          <>
            <button
              className="slider-lightbox-nav slider-prev animate-fade-in fill-forwards animation-delay-200"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <MdChevronLeft />
            </button>
            <button
              className="slider-lightbox-nav slider-next animate-fade-in fill-forwards animation-delay-200"
              onClick={nextImage}
              aria-label="Next image"
            >
              <MdChevronRight />
            </button>
            <div className="slider-lightbox-counter animate-fade-up fill-forwards animation-delay-300">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function ImageSlider({
  images,
  title,
  imageLayout = "cover",
  autoplay = false,
  autoplayInterval = 5000,
}: ImageSliderProps) {
  const options = useMemo<EmblaOptionsType>(
    () => ({
      loop: images.length > 1,
      align: "start",
      containScroll: "trimSnaps",
    }),
    [images.length],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Navigation controls
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  // Event handlers
  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  // Set up Embla
  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);

    // Force reinitialization for reliable rendering
    const timer = setTimeout(() => emblaApi.reInit(), 50);

    return () => {
      clearTimeout(timer);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi, onInit, onSelect]);

  // Autoplay
  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else if (options.loop) {
        emblaApi.scrollTo(0);
      }
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, autoplay, autoplayInterval, options.loop]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);

    if (newState) {
      document.body.classList.add("lightbox-open");
    } else {
      document.body.classList.remove("lightbox-open");
    }
  }, [isFullscreen]);

  if (!images || images.length === 0) return null;

  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="slider embla"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={
        {
          "--slider-image-count": images.length,
          "--current-index": selectedIndex,
        } as React.CSSProperties
      }
      aria-label={`${title} image gallery`}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {images.map((image, index) => (
            <div className="embla__slide" key={`slide-${index}`}>
              <img
                src={image}
                alt={`${title} - image ${index + 1}`}
                className="slider-image"
                style={{ objectFit: imageLayout }}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={`slider-controls ${showControls ? "visible" : ""}`}>
        {hasMultipleImages && (
          <>
            <button
              className="slider-button slider-prev"
              onClick={scrollPrev}
              disabled={!emblaApi?.canScrollPrev() && !options.loop}
              aria-label="Previous slide"
            >
              <MdChevronLeft />
            </button>

            <button
              className="slider-button slider-next"
              onClick={scrollNext}
              disabled={!emblaApi?.canScrollNext() && !options.loop}
              aria-label="Next slide"
            >
              <MdChevronRight />
            </button>

            <div className="slider-pagination">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === selectedIndex ? "active" : ""}`}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="slider-counter">
              {selectedIndex + 1}/{images.length}
            </div>
          </>
        )}

        <button
          className="slider-fullscreen"
          onClick={toggleFullscreen}
          aria-label="View fullscreen"
        >
          <MdFullscreen />
        </button>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={isFullscreen}
        onClose={toggleFullscreen}
        images={images}
        initialIndex={selectedIndex}
        title={title}
      />
    </div>
  );
}
