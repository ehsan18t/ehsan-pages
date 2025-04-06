import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PDFFile = string | File | null;

export default function PDFViewer() {
  const [file] = useState<PDFFile>("/CV.pdf");
  const [numPages, setNumPages] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900); // Default width

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Initial width
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="max-w-4xl">
      <div className="pdf-document-container" ref={containerRef}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
          error={
            <div>
              Error loading PDF. Make sure extensions like IDM are disabled then
              try again.
            </div>
          }
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              className="mb-1"
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={Math.min(containerWidth, 900)}
              loading={<div>Loading page...</div>}
              error={<div>Error rendering page.</div>}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
