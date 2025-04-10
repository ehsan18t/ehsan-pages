import React, { useEffect, useRef, useState } from "react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const touchStartX = useRef(0);
  const isVerticalScroll = useRef<boolean | null>(null);

  const goToSlide = (index: number) => {
    if (!sliderContainerRef.current) return;
    const container = sliderContainerRef.current;
    const slideWidth = container.clientWidth;

    // Set flag to indicate programmatic scrolling
    scrollingRef.current = true;

    container.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });

    setCurrentSlide(index);

    // Clear the flag after animation completes
    setTimeout(() => {
      scrollingRef.current = false;
    }, 500);
  };

  const navigateSlide = (direction: number) => {
    const newIndex = currentSlide + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      goToSlide(newIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isVerticalScroll.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isVerticalScroll.current === null) {
      const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
      const diffY = Math.abs(e.touches[0].clientY - touchStartX.current);
      isVerticalScroll.current = diffY > diffX;
    }

    if (!isVerticalScroll.current) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isVerticalScroll.current) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 30) {
      navigateSlide(diffX < 0 ? 1 : -1);
    }
  };

  const handleScroll = () => {
    if (!sliderContainerRef.current || scrollingRef.current) return;

    const container = sliderContainerRef.current;
    const slideWidth = container.clientWidth;
    const scrollPosition = container.scrollLeft;

    // Use a more precise calculation
    const exactIndex = scrollPosition / slideWidth;
    const newIndex = Math.round(exactIndex);

    if (
      newIndex >= 0 &&
      newIndex < images.length &&
      newIndex !== currentSlide
    ) {
      setCurrentSlide(newIndex);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Add keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        navigateSlide(-1);
      } else if (e.key === "ArrowRight") {
        navigateSlide(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentSlide]);

  // Scroll event listener
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (container) {
      const throttledScrollHandler = () => {
        if (!scrollingRef.current) {
          window.requestAnimationFrame(() => {
            handleScroll();
          });
        }
      };

      container.addEventListener("scroll", throttledScrollHandler, {
        passive: true,
      });
      return () => {
        container.removeEventListener("scroll", throttledScrollHandler);
      };
    }
  }, [currentSlide]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("lightbox-open");
    } else {
      document.body.classList.remove("lightbox-open");
    }
  }, [isFullscreen]);

  return (
    <>
      <div
        className="slider-viewport"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={sliderContainerRef}
          className="slider-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images?.map((url, index) => (
            <div
              key={index}
              className={`slider-slide ${index === currentSlide ? "active" : ""}`}
            >
              <img
                src={url}
                alt={`${title} screenshot ${index + 1}`}
                loading="lazy"
                width="800"
                height="500"
                style={{ objectFit: imageLayout }}
              />
            </div>
          ))}
        </div>

        {images?.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous Slide"
              className="slider-button prev"
              onClick={() => navigateSlide(-1)}
            >
              <MdChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next Slide"
              className="slider-button next"
              onClick={() => navigateSlide(1)}
            >
              <MdChevronRight />
            </button>

            <div className="slider-pagination">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="slide-counter">
              <span className="current-slide">{currentSlide + 1}</span>
              <span className="total-slides">/{images.length}</span>
            </div>
          </>
        )}

        <button
          type="button"
          className="fullscreen-button"
          aria-label="View image fullscreen"
          onClick={toggleFullscreen}
        >
          <MdFullscreen />
        </button>
      </div>

      <div className={`lightbox-container ${isFullscreen ? "active" : ""}`}>
        <div className="lightbox-content">
          <img
            src={images[currentSlide]}
            alt={`${title} in fullscreen mode`}
            className="lightbox-img"
          />
          <button
            className="lightbox-close"
            aria-label="Close fullscreen view"
            onClick={toggleFullscreen}
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </>
  );
};

export default ImageSlider;
