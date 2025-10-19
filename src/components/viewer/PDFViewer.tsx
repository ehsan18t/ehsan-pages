import { useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type ReactPdfModule = typeof import("react-pdf");

export default function PDFViewer({ cvPDF }: { cvPDF: string }) {
  const [numPages, setNumPages] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [pdfLib, setPdfLib] = useState<ReactPdfModule | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Load react-pdf lazily to avoid SSR-only DOM usage.
  useEffect(() => {
    let isCancelled = false;

    if (typeof window === "undefined") return;

    import("react-pdf")
      .then((module) => {
        if (isCancelled) return;
        module.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        setPdfLib(module);
      })
      .catch((err) => {
        if (isCancelled) return;
        setViewerError(
          err instanceof Error
            ? `Failed to load PDF viewer: ${err.message}`
            : "Failed to load PDF viewer",
        );
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Improved fetch with cache busting
  const fetchPdf = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setNumPages(undefined);

    try {
      const response = await fetch("/api/get-file-as-blob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Buster": Date.now().toString(), // Prevent stale cache
        },
        body: JSON.stringify({ fileUrl: url.trim() }),
      });

      if (!response.ok)
        throw new Error(`Failed to load: ${response.statusText}`);

      const blob = await response.blob();
      const newBlobUrl = URL.createObjectURL(blob);

      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); // Cleanup
      setIsRendering(true);
      setPdfBlobUrl(newBlobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and URL change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (cvPDF.trim()) fetchPdf(cvPDF);
  }, [cvPDF]);

  useEffect(() => {
    if (!pdfBlobUrl) return;
    return () => {
      URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Responsive width handling
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const DocumentComponent = pdfLib?.Document;
  const PageComponent = pdfLib?.Page;

  const renderStatus = (message: string, showRetry = false) => (
    <div className="flex h-full w-full items-center justify-center text-center">
      <div className="space-y-4">
        <p>{message}</p>
        {showRetry && (
          <button
            className="rounded-md border border-white/20 px-3 py-2 text-sm transition-colors hover:border-white/40"
            onClick={() => fetchPdf(cvPDF)}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full max-w-4xl flex-col" ref={containerRef}>
      {viewerError ? (
        renderStatus(viewerError)
      ) : error ? (
        renderStatus(
          "Error loading PDF. Disable extensions like IDM and try again.",
          true,
        )
      ) : !DocumentComponent || !PageComponent ? (
        renderStatus("Preparing viewer...")
      ) : isLoading && !pdfBlobUrl ? (
        renderStatus("Loading PDF...")
      ) : (
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto">
          {isRendering && (
            <div className="absolute inset-0 z-10">
              {renderStatus("Rendering PDF...")}
            </div>
          )}
          <div className={isRendering ? "invisible" : "visible"}>
            <DocumentComponent
              file={pdfBlobUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setIsRendering(false);
              }}
              onLoadError={() => setIsRendering(false)}
              error={renderStatus("Failed to render PDF")}
            >
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <PageComponent
                  className="mb-1"
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  width={Math.min(containerWidth, 900)}
                  loading={<div>Loading page {i + 1}...</div>}
                />
              ))}
            </DocumentComponent>
          </div>
        </div>
      )}
    </div>
  );
}
