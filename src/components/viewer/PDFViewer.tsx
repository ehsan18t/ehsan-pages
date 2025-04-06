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
  const [containerWidth, setContainerWidth] = useState(900);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Improved fetch with cache busting
  const fetchPdf = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Buster": Date.now().toString(), // Prevent stale cache
        },
        body: JSON.stringify({ pdfUrl: url.trim() }),
      });

      if (!response.ok)
        throw new Error(`Failed to load: ${response.statusText}`);

      const blob = await response.blob();
      const newBlobUrl = URL.createObjectURL(blob);

      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); // Cleanup
      setPdfBlobUrl(newBlobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and URL change
  useEffect(() => {
    if (cvPDF.trim()) fetchPdf(cvPDF);
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [cvPDF]);

  // Responsive width handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="max-w-4xl" ref={containerRef}>
      {isLoading && !pdfBlobUrl ? (
        <div className="pt-3">Loading PDF...</div>
      ) : error ? (
        <div className="pt-3">
          Error loading PDF. Disable extensions like IDM and try again.
          <button onClick={() => fetchPdf(cvPDF)}>Retry</button>
        </div>
      ) : (
        <Document
          file={pdfBlobUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="pt-3">Rendering PDF...</div>}
          error={<div className="pt-3">Failed to render PDF</div>}
        >
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <Page
              className="mb-1"
              key={`page_${i + 1}`}
              pageNumber={i + 1}
              width={Math.min(containerWidth, 900)}
              loading={<div>Loading page {i + 1}...</div>}
            />
          ))}
        </Document>
      )}
    </div>
  );
}
