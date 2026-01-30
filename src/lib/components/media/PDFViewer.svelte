<script lang="ts">
	import { browser } from '$app/environment';
	import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
	import { onDestroy, onMount } from 'svelte';

	type PdfjsLib = typeof import('pdfjs-dist');

	interface Props {
		cvPDF: string;
	}

	let { cvPDF }: Props = $props();

	let containerRef: HTMLDivElement | null = null;
	let pagesContainer: HTMLDivElement | null = null;
	let containerWidth = 900;
	let numPages = $state<number>(0);
	let isLoading = $state(true);
	let isRendering = false;
	let error = $state<string | null>(null);
	let pdfDocument: PDFDocumentProxy | null = null;
	let pdfBlobUrl: string | null = null;
	let pdfjsLib: PdfjsLib | null = null;
	let renderToken = 0;
	let resizeRaf: number | null = null;
	let pendingRender = false;
	let lastRenderedWidth = 0;
	let initialRenderDone = false;

	// High-DPI support - render at higher resolution
	const getPixelRatio = () => (browser ? Math.min(window.devicePixelRatio || 1, 2) : 1);

	function containerRefAttachment(node: HTMLDivElement) {
		containerRef = node;
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? node.clientWidth;
			if (!width) return;

			containerWidth = width;
			if (resizeRaf !== null) {
				cancelAnimationFrame(resizeRaf);
			}
			resizeRaf = requestAnimationFrame(() => {
				if (pdfDocument && pagesContainer) {
					renderAllPages();
				} else {
					pendingRender = true;
				}
			});
		});

		observer.observe(node);

		return () => {
			observer.disconnect();
			if (containerRef === node) {
				containerRef = null;
			}
		};
	}

	function pagesContainerAttachment(node: HTMLDivElement) {
		pagesContainer = node;
		// If PDF was already loaded, render now
		if (pdfDocument && numPages > 0 && !initialRenderDone) {
			console.log('[PDFViewer] pagesContainer attached with PDF ready, triggering render');
			initialRenderDone = true;
			setTimeout(() => renderAllPages(true), 0);
		}
		return () => {
			if (pagesContainer === node) {
				pagesContainer = null;
			}
		};
	}

	onMount(async () => {
		console.log('[PDFViewer] onMount started');
		try {
			const pdfjs = await import('pdfjs-dist');
			pdfjsLib = pdfjs;
			console.log('[PDFViewer] pdfjs-dist imported, version:', pdfjs.version);

			// Use bundled worker from pdfjs-dist package
			const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
			pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
			console.log('[PDFViewer] Worker source set from bundle');

			if (cvPDF.trim()) {
				console.log('[PDFViewer] Starting to fetch PDF:', cvPDF);
				await fetchPdf(cvPDF);
			} else {
				console.warn('[PDFViewer] cvPDF is empty');
			}
		} catch (err) {
			console.error('[PDFViewer] onMount error:', err);
			error = err instanceof Error ? err.message : 'Failed to initialize PDF viewer';
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (!browser) return;
		if (resizeRaf !== null) {
			cancelAnimationFrame(resizeRaf);
			resizeRaf = null;
		}
		if (pdfBlobUrl) {
			URL.revokeObjectURL(pdfBlobUrl);
		}
		if (pdfDocument) {
			pdfDocument.destroy();
		}
	});

	async function fetchPdf(url: string) {
		console.log('[PDFViewer] fetchPdf called with:', url);
		if (!pdfjsLib) {
			console.error('[PDFViewer] pdfjsLib not loaded');
			return;
		}

		isLoading = true;
		error = null;
		numPages = 0;

		try {
			console.log('[PDFViewer] Fetching blob from API...');
			const response = await fetch('/api/get-file-as-blob', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Buster': Date.now().toString()
				},
				body: JSON.stringify({ fileUrl: url.trim() })
			});

			console.log('[PDFViewer] API response status:', response.status, response.statusText);

			if (!response.ok) {
				throw new Error(`Failed to load: ${response.statusText}`);
			}

			const blob = await response.blob();
			console.log('[PDFViewer] Blob received, size:', blob.size, 'type:', blob.type);
			const newBlobUrl = URL.createObjectURL(blob);
			console.log('[PDFViewer] Blob URL created:', newBlobUrl);

			if (pdfBlobUrl) {
				URL.revokeObjectURL(pdfBlobUrl);
			}

			pdfBlobUrl = newBlobUrl;

			console.log('[PDFViewer] Loading PDF document...');
			const loadingTask = pdfjsLib.getDocument(newBlobUrl);
			pdfDocument = await loadingTask.promise;
			numPages = pdfDocument.numPages;
			console.log('[PDFViewer] PDF loaded successfully, pages:', numPages);

			await renderAllPages(true);
			console.log('[PDFViewer] All pages rendered');
		} catch (err) {
			console.error('[PDFViewer] fetchPdf error:', err);
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			isLoading = false;
		}
	}

	async function renderPage(page: PDFPageProxy, pageWrapper: HTMLDivElement, pixelRatio: number) {
		const baseViewport = page.getViewport({ scale: 1 });
		const targetWidth = containerWidth;
		const scale = targetWidth / baseViewport.width;
		const viewport = page.getViewport({ scale });

		pageWrapper.style.width = `${viewport.width}px`;
		pageWrapper.style.height = `${viewport.height}px`;

		// Canvas layer
		const canvas = document.createElement('canvas');
		canvas.className = 'pdf-canvas';
		const context = canvas.getContext('2d');

		// High-DPI: render at higher resolution, scale down via CSS
		canvas.width = Math.floor(viewport.width * pixelRatio);
		canvas.height = Math.floor(viewport.height * pixelRatio);
		canvas.style.width = `${viewport.width}px`;
		canvas.style.height = `${viewport.height}px`;

		if (context) {
			context.scale(pixelRatio, pixelRatio);
			await page.render({
				canvasContext: context,
				viewport
			}).promise;
		}

		pageWrapper.appendChild(canvas);

		// Text layer for selection
		const textContent = await page.getTextContent();
		const textLayerDiv = document.createElement('div');
		textLayerDiv.className = 'pdf-text-layer';

		// Render text items positioned over the canvas
		for (const item of textContent.items) {
			if ('str' in item && item.str) {
				const tx = item.transform;
				const span = document.createElement('span');
				span.textContent = item.str;
				span.style.left = `${tx[4] * scale}px`;
				span.style.top = `${viewport.height - tx[5] * scale - (item.height || 12) * scale}px`;
				span.style.fontSize = `${(item.height || 12) * scale}px`;
				span.style.fontFamily = item.fontName || 'sans-serif';
				textLayerDiv.appendChild(span);
			}
		}

		pageWrapper.appendChild(textLayerDiv);

		// Annotation layer for links
		const annotations = await page.getAnnotations();
		const annotationLayerDiv = document.createElement('div');
		annotationLayerDiv.className = 'pdf-annotation-layer';

		for (const annotation of annotations) {
			if (annotation.subtype === 'Link' && annotation.url) {
				const rect = annotation.rect;
				const link = document.createElement('a');
				link.href = annotation.url;
				link.target = '_blank';
				link.rel = 'noopener noreferrer';
				link.className = 'pdf-link';

				// PDF coordinates: bottom-left origin, need to convert
				const left = rect[0] * scale;
				const bottom = rect[1] * scale;
				const right = rect[2] * scale;
				const top = rect[3] * scale;

				link.style.left = `${left}px`;
				link.style.top = `${viewport.height - top}px`;
				link.style.width = `${right - left}px`;
				link.style.height = `${top - bottom}px`;

				annotationLayerDiv.appendChild(link);
			}
		}

		pageWrapper.appendChild(annotationLayerDiv);
	}

	async function renderAllPages(force = false) {
		if (!pdfDocument || !pagesContainer) return;
		if (!force && lastRenderedWidth && Math.abs(containerWidth - lastRenderedWidth) < 5) return;
		if (isRendering) {
			pendingRender = true;
			return;
		}

		renderToken += 1;
		const currentToken = renderToken;
		isRendering = true;
		lastRenderedWidth = containerWidth;

		const pixelRatio = getPixelRatio();

		try {
			pagesContainer.innerHTML = '';

			for (let pageNum = 1; pageNum <= numPages; pageNum++) {
				if (currentToken !== renderToken) return;

				const page = await pdfDocument.getPage(pageNum);
				const pageWrapper = document.createElement('div');
				pageWrapper.className = 'pdf-page';

				await renderPage(page, pageWrapper, pixelRatio);

				if (currentToken !== renderToken) return;

				pagesContainer.appendChild(pageWrapper);
			}
		} finally {
			if (currentToken === renderToken) {
				isRendering = false;
				if (pendingRender) {
					pendingRender = false;
					renderAllPages(true);
				}
			}
		}
	}

	async function retry() {
		if (cvPDF.trim()) {
			await fetchPdf(cvPDF);
		}
	}
</script>

<div class="pdf-viewer" {@attach containerRefAttachment}>
	{#if error}
		<div class="state-container">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="error-icon"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<p>Error loading PDF</p>
			<p class="error-detail">{error}</p>
			<p class="hint">Try disabling browser extensions like IDM</p>
			<button class="retry-btn" onclick={retry}>Try Again</button>
		</div>
	{:else}
		<div class="pages-scroll-area">
			{#if isLoading}
				<div class="loading-overlay">
					<div class="spinner"></div>
					<p>Loading PDF...</p>
				</div>
			{/if}
			<div class="pages-container" {@attach pagesContainerAttachment}></div>
		</div>
	{/if}
</div>

<style>
	.pdf-viewer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		background: white;
	}

	.state-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		text-align: center;
		gap: 0.75rem;
		color: white;
		padding: 2rem;
	}

	.error-icon {
		opacity: 0.6;
		margin-bottom: 0.5rem;
	}

	.error-detail {
		font-size: 0.75rem;
		opacity: 0.8;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		max-width: 100%;
		word-break: break-word;
		font-family: monospace;
	}

	.hint {
		font-size: 0.875rem;
		opacity: 0.6;
	}

	.retry-btn {
		margin-top: 0.5rem;
		padding: 0.5rem 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		background: transparent;
		color: inherit;
		transition: all 0.2s;
	}

	.retry-btn:hover {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.1);
	}

	.pages-scroll-area {
		position: relative;
		flex: 1;
		overflow-x: hidden;
		overflow-y: auto;
		background: white;
	}

	.pages-container {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
		padding: 0;
		min-height: 100%;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: #525659;
		color: white;
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(255, 255, 255, 0.2);
		border-top-color: oklch(var(--accent-500));
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* PDF Page styles */
	:global(.pdf-page) {
		position: relative;
		background: white;
		overflow: hidden;
	}

	:global(.pdf-page + .pdf-page) {
		margin-top: 16px;
		border-top: 4px solid #d0d0d0;
		padding-top: 0;
	}

	:global(.pdf-canvas) {
		display: block;
	}

	/* Text layer for selection */
	:global(.pdf-text-layer) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		opacity: 0.2;
		line-height: 1;
	}

	:global(.pdf-text-layer span) {
		color: transparent;
		position: absolute;
		white-space: pre;
		cursor: text;
		transform-origin: 0% 0%;
	}

	:global(.pdf-text-layer ::selection) {
		background: rgba(0, 0, 255, 0.3);
	}

	/* Annotation layer for links */
	:global(.pdf-annotation-layer) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	:global(.pdf-link) {
		position: absolute;
		pointer-events: auto;
		cursor: pointer;
		border-radius: 2px;
	}

	:global(.pdf-link:hover) {
		background: rgba(0, 100, 200, 0.15);
	}
</style>
