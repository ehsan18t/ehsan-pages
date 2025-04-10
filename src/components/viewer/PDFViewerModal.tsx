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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[999]"
      onClick={() => setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="pb-3 bg-[rgb(var(--background))]/75 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-white/10">
          <Button link={cvPDF}>Download CV</Button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-300 hover:text-white text-6xl leading-none px-2 transition-colors cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable PDF Content */}
        <div className="overflow-y-auto pb-4 px-1 md:px-2 lg:px-4 bg-[rgb(var(--background))]">
          <PDFViewer cvPDF={cvPDF} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex items-center justify-center md:justify-start">
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
