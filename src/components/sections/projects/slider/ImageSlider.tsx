import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight, MdFullscreen } from "react-icons/md";

import "./image-slider.css";

interface ImageSliderProps {
  images: string[];
  title: string;
  imageLayout?: "cover" | "contain";
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  title,
  imageLayout = "cover",
}) => {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Refs
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const preventScrollUpdate = useRef(false);

  // Go to a specific slide directly (no scroll events)
  const goToSlide = (index: number) => {
    if (index < 0 || index >= images.length) return;

    setCurrentIndex(index);
    preventScrollUpdate.current = true;

    if (sliderTrackRef.current) {
      sliderTrackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }

    // Clear the flag after animation completes
    setTimeout(() => {
      preventScrollUpdate.current = false;
    }, 500);
  };

  // Navigate left/right
  const navigate = (direction: number) => {
    goToSlide(currentIndex + direction);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        } else if (e.key === "ArrowLeft") {
          navigate(-1);
        } else if (e.key === "ArrowRight") {
          navigate(1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentIndex]);

  // Handle body scroll locking
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Render the Fullscreen component using a portal
  const renderFullscreen = () => {
    if (!isFullscreen) return null;

    return createPortal(
      <div className="new-slider-lightbox">
        <div className="new-slider-lightbox-content">
          <img
            src={images[currentIndex]}
            alt={`${title} (fullscreen view)`}
            className="new-slider-lightbox-image"
          />

          <button
            className="new-slider-lightbox-close"
            onClick={toggleFullscreen}
            aria-label="Close fullscreen view"
          >
            <FaTimes />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="new-slider-lightbox-nav new-slider-prev"
                onClick={() => navigate(-1)}
                disabled={currentIndex === 0}
                aria-label="Previous image"
              >
                <MdChevronLeft />
              </button>
              <button
                className="new-slider-lightbox-nav new-slider-next"
                onClick={() => navigate(1)}
                disabled={currentIndex === images.length - 1}
                aria-label="Next image"
              >
                <MdChevronRight />
              </button>

              <div className="new-slider-lightbox-counter">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <div
      className="new-slider"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main slider track - direct transform, no scrolling */}
      <div
        ref={sliderTrackRef}
        className="new-slider-track"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="new-slider-slide"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={image}
              alt={`${title} - image ${index + 1}`}
              className="new-slider-image"
              style={{ objectFit: imageLayout }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={`new-slider-controls ${showControls ? "visible" : ""}`}>
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              className="new-slider-button new-slider-prev"
              onClick={() => navigate(-1)}
              disabled={currentIndex === 0}
              aria-label="Previous slide"
            >
              <MdChevronLeft />
            </button>
            <button
              className="new-slider-button new-slider-next"
              onClick={() => navigate(1)}
              disabled={currentIndex === images.length - 1}
              aria-label="Next slide"
            >
              <MdChevronRight />
            </button>

            {/* Pagination dots */}
            <div className="new-slider-pagination">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`new-slider-dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Counter */}
            <div className="new-slider-counter">
              <span>{currentIndex + 1}</span>/<span>{images.length}</span>
            </div>
          </>
        )}

        {/* Fullscreen button */}
        <button
          className="new-slider-fullscreen"
          onClick={toggleFullscreen}
          aria-label="View fullscreen"
        >
          <MdFullscreen />
        </button>
      </div>

      {/* Render fullscreen view using portal */}
      {renderFullscreen()}
    </div>
  );
};

export default ImageSlider;
