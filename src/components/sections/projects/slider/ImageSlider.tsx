import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight, MdFullscreen } from "react-icons/md";
import "./image-slider.css"; // We'll adapt this CSS file

type ImageSliderProps = {
  images: string[]; // Expecting an array of image URLs
  title: string;
  imageLayout?: "cover" | "contain";
};

export default function ImageSlider({
  images,
  title,
  imageLayout = "cover",
}: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1, // Enable loop if more than one image
    align: "start",
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0); // Separate index for lightbox
  const [showControls, setShowControls] = useState(false); // For hover effect

  // --- Embla Navigation ---
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  // --- Lightbox Navigation ---
  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };
  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // --- Update State on Embla Events ---
  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit); // Re-initialize on resize etc.
    emblaApi.on("reInit", onSelect);

    return () => {
      // Clean up listeners - potential issue fixed here
      if (emblaApi) {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onInit);
        emblaApi.off("reInit", onSelect);
      }
    };
  }, [emblaApi, onInit, onSelect]);

  // --- Fullscreen Handling ---
  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    if (newState) {
      setLightboxIndex(selectedIndex); // Start lightbox at current slider index
      document.documentElement.classList.add("lightbox-open"); // Use html element
      document.body.classList.add("lightbox-open"); // Keep body class too for potential targeting
      // Calculate scrollbar width and set CSS variable (optional but good)
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-width",
        `${scrollbarWidth}px`,
      );
    } else {
      document.documentElement.classList.add("lightbox-closing");
      document.body.classList.add("lightbox-closing");
      // Remove classes after a short delay to allow transitions
      setTimeout(() => {
        document.documentElement.classList.remove(
          "lightbox-open",
          "lightbox-closing",
        );
        document.body.classList.remove("lightbox-open", "lightbox-closing");
        document.documentElement.style.removeProperty("--scrollbar-width");
      }, 500); // Match CSS transition duration if possible
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleFullscreen();
      else if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "ArrowRight") lightboxNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, lightboxIndex]); // Rerun if index changes for correct prev/next

  if (!images || images.length === 0) return null; // Handle empty images array

  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="slider embla" // Use 'embla' base class
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      // Add CSS variables for dynamic styling if needed
      style={
        {
          "--slider-image-count": images.length,
          "--current-index": selectedIndex,
        } as React.CSSProperties
      }
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {images.map((image, index) => (
            <div className="embla__slide" key={`${image}-${index}`}>
              {" "}
              {/* Ensure unique keys */}
              {/* Optional: Add loading state indicator here if needed */}
              <img
                src={image}
                alt={`${title} - image ${index + 1}`}
                className="slider-image" // Keep your custom class for styling
                style={{ objectFit: imageLayout }}
                loading={index === 0 ? "eager" : "lazy"} // Native lazy loading
              />
            </div>
          ))}
        </div>
      </div>

      {/* Use existing controls structure, just hook up Embla functions */}
      <div className={`slider-controls ${showControls ? "visible" : ""}`}>
        {hasMultipleImages && (
          <>
            <button
              className="slider-button slider-prev"
              onClick={scrollPrev}
              disabled={!emblaApi?.canScrollPrev()}
              aria-label="Previous slide"
            >
              <MdChevronLeft />
            </button>
            <button
              className="slider-button slider-next"
              onClick={scrollNext}
              disabled={!emblaApi?.canScrollNext()}
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

      {/* Lightbox Portal */}
      {isFullscreen &&
        createPortal(
          <div className="slider-lightbox" onClick={toggleFullscreen}>
            {" "}
            {/* Close on backdrop click */}
            <div
              className="slider-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              {/* Prevent content click from closing */}
              <img
                src={images[lightboxIndex]}
                alt={`${title} (fullscreen view) - image ${lightboxIndex + 1}`}
                className="slider-lightbox-image"
              />
              <button
                className="slider-lightbox-close"
                onClick={toggleFullscreen}
                aria-label="Close fullscreen view"
              >
                <FaTimes />
              </button>
              {hasMultipleImages && (
                <>
                  <button
                    className="slider-lightbox-nav slider-prev"
                    onClick={lightboxPrev}
                    disabled={images.length <= 1} // Disable if only one image
                    aria-label="Previous image"
                  >
                    <MdChevronLeft />
                  </button>
                  <button
                    className="slider-lightbox-nav slider-next"
                    onClick={lightboxNext}
                    disabled={images.length <= 1} // Disable if only one image
                    aria-label="Next image"
                  >
                    <MdChevronRight />
                  </button>

                  <div className="slider-lightbox-counter">
                    {lightboxIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
