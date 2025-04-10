import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight, MdFullscreen } from "react-icons/md";
import "./image-slider.css";

type ImageSliderProps = {
  images: string[];
  title: string;
  imageLayout?: "cover" | "contain";
};

export default function ImageSlider({
  images,
  title,
  imageLayout = "cover",
}: ImageSliderProps) {
  // Core state with minimal but essential typing
  const [state, setState] = useState({
    currentIndex: 0,
    isFullscreen: false,
    showControls: false,
  });

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const preventScrollUpdate = useRef(false);
  const animationFrameRef = useRef<number>(0);

  // Derived values don't need explicit types
  const { currentIndex, isFullscreen, showControls } = state;
  const hasMultipleImages = images.length > 1;

  const goToSlide = (index: number) => {
    if (index < 0 || index >= images.length) return;

    cancelAnimationFrame(animationFrameRef.current!);

    animationFrameRef.current = requestAnimationFrame(() => {
      setState((prev) => ({ ...prev, currentIndex: index }));
      preventScrollUpdate.current = true;

      sliderTrackRef.current!.style.transform = `translateX(-${index * 100}%)`;

      setTimeout(() => {
        preventScrollUpdate.current = false;
      }, 500);
    });
  };

  const navigate = (direction: number) => {
    goToSlide(currentIndex + direction);
  };

  const toggleFullscreen = () => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  // Effects with only necessary typing
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleFullscreen();
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "ArrowRight") navigate(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentIndex]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [isFullscreen]);

  if (!images.length) return null;

  return (
    <div
      className="slider"
      onMouseEnter={() => setState((prev) => ({ ...prev, showControls: true }))}
      onMouseLeave={() =>
        setState((prev) => ({ ...prev, showControls: false }))
      }
    >
      <div
        ref={sliderTrackRef}
        className="slider-track"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={image} // Using URL as key is often better for image sliders
            className="slider-slide"
            style={{ width: `${100 / images.length}%` }}
          >
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

      <div className={`slider-controls ${showControls ? "visible" : ""}`}>
        {hasMultipleImages && (
          <>
            <button
              className="slider-button slider-prev"
              onClick={() => navigate(-1)}
              disabled={currentIndex === 0}
              aria-label="Previous slide"
            >
              <MdChevronLeft />
            </button>
            <button
              className="slider-button slider-next"
              onClick={() => navigate(1)}
              disabled={currentIndex === images.length - 1}
              aria-label="Next slide"
            >
              <MdChevronRight />
            </button>

            <div className="slider-pagination">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="slider-counter">
              {currentIndex + 1}/{images.length}
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

      {isFullscreen &&
        createPortal(
          <div className="slider-lightbox">
            <div className="slider-lightbox-content">
              <img
                src={images[currentIndex]}
                alt={`${title} (fullscreen view)`}
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
                    onClick={() => navigate(-1)}
                    disabled={currentIndex === 0}
                    aria-label="Previous image"
                  >
                    <MdChevronLeft />
                  </button>
                  <button
                    className="slider-lightbox-nav slider-next"
                    onClick={() => navigate(1)}
                    disabled={currentIndex === images.length - 1}
                    aria-label="Next image"
                  >
                    <MdChevronRight />
                  </button>

                  <div className="slider-lightbox-counter">
                    {currentIndex + 1} / {images.length}
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
