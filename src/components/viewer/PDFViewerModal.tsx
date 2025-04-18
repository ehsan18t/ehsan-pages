import Button from "@/components/button/Button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PDFViewer from "./PDFViewer";

const PDFViewerModal = ({ cvPDF }: { cvPDF: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [isModalOpen]);

  // Modal content that will be rendered in the portal
  const modalContent = isModalOpen && (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={() => setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-white/20 bg-[rgb(var(--background))]/75 pb-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 select-none">
          <Button link={cvPDF}>Download CV</Button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="cursor-pointer px-2 text-6xl leading-none text-gray-300 transition-colors select-none hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable PDF Content */}
        <div className="overflow-y-auto bg-[rgb(var(--background))] px-1 pb-4 md:px-2 lg:px-4">
          <PDFViewer cvPDF={cvPDF} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full items-center justify-center select-none md:justify-start">
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
