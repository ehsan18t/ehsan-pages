import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PDFViewer({ cvPDF }: { cvPDF: string }) {
  const [numPages, setNumPages] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900); // Default width
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch PDF whenever currentUrl changes
  useEffect(() => {
    const fetchPdf = async () => {
      if (!cvPDF.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/fetch-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfUrl: cvPDF.trim() }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }

        const blob = await response.blob();
        const newBlobUrl = URL.createObjectURL(blob);

        // Revoke previous URL if exists
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);

        setPdfBlobUrl(newBlobUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();
  }, []);

  // Clean up Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

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
    <div className="max-w-4xl" ref={containerRef}>
      <Document
        file={pdfBlobUrl}
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
  );
}
