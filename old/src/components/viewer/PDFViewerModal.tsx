import Button from "@/components/button/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PDFViewer from "./PDFViewer";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const PDFViewerModal = ({ cvPDF }: { cvPDF: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isModalOpen]);

  // Restore focus on close and trap focus within the dialog while open.
  useEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const focusable =
      modalContainerRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTORS,
      );
    focusable?.[0]?.focus();

    return () => {
      previouslyFocusedElement.current?.focus();
      previouslyFocusedElement.current = null;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !modalContainerRef.current) return;

      const focusable = Array.from(
        modalContainerRef.current.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTORS,
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        const shouldLoop = !active || active === first;
        if (shouldLoop) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalOpen]);

  // Modal content that will be rendered in the portal
  const modalContent = isModalOpen && (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-4 py-4 backdrop-blur-sm"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-[min(92vh,_calc(100vh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[rgb(var(--background))]/75 pb-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        ref={modalContainerRef}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 select-none">
          <Button link={cvPDF}>Download CV</Button>
          <button
            onClick={closeModal}
            className="cursor-pointer px-2 text-6xl leading-none text-gray-300 transition-colors select-none hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable PDF Content */}
        <div className="flex-1 overflow-hidden bg-[rgb(var(--background))] px-1 pb-4 md:px-2 lg:px-4">
          <PDFViewer cvPDF={cvPDF} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full items-center justify-center select-none md:justify-start">
      <Button onClick={() => setIsModalOpen(true)} className="w-3xs font-bold">
        View CV
      </Button>

      {/* Use createPortal to render modal outside of component hierarchy */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </div>
  );
};

export default PDFViewerModal;
