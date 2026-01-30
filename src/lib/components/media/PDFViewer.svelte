<script lang="ts">
	import { browser } from '$app/environment';
	import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
	import { onDestroy, onMount } from 'svelte';

	// Dynamic import type for pdfjs-dist
	type PdfjsLib = typeof import('pdfjs-dist');

	interface Props {
		cvPDF: string;
	}

	let { cvPDF }: Props = $props();

	let containerRef = $state<HTMLDivElement | null>(null);
	let pagesContainer = $state<HTMLDivElement | null>(null);
	let containerWidth = $state(900);
	let numPages = $state<number>(0);
	let isLoading = $state(false);
	let isRendering = $state(false);
	let error = $state<string | null>(null);
	let pdfDocument = $state<PDFDocumentProxy | null>(null);
	let pdfBlobUrl = $state<string | null>(null);
	let pdfjsLib = $state<PdfjsLib | null>(null);
	let renderToken = 0;
	let resizeRaf: number | null = null;
	let pendingRender = false;
	let lastRenderedWidth = 0;

	// Get device pixel ratio for high-DPI rendering (capped at 2 for performance)
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
		return () => {
			if (pagesContainer === node) {
				pagesContainer = null;
			}
		};
	}

	// Initialize PDF.js worker - client-only
	onMount(async () => {
		// Dynamically import pdfjs-dist only on client
		const pdfjs = await import('pdfjs-dist');
		pdfjsLib = pdfjs;

		// Set up the worker
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).toString();

		// Fetch PDF
		if (cvPDF.trim()) {
			await fetchPdf(cvPDF);
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
		if (!pdfjsLib) return;

		isLoading = true;
		error = null;
		numPages = 0;

		try {
			const response = await fetch('/api/get-file-as-blob', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Buster': Date.now().toString()
				},
				body: JSON.stringify({ fileUrl: url.trim() })
			});

			if (!response.ok) {
				throw new Error(`Failed to load: ${response.statusText}`);
			}

			const blob = await response.blob();
			const newBlobUrl = URL.createObjectURL(blob);

			if (pdfBlobUrl) {
				URL.revokeObjectURL(pdfBlobUrl);
			}

			pdfBlobUrl = newBlobUrl;

			// Load the PDF document
			const loadingTask = pdfjsLib.getDocument(newBlobUrl);
			pdfDocument = await loadingTask.promise;
			numPages = pdfDocument.numPages;

			// Render all pages
			await renderAllPages();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			isLoading = false;
			isRendering = false;
		}
	}

	async function renderAllPages(force = false) {
		if (!pdfDocument || !pagesContainer) return;
		if (!force && lastRenderedWidth && Math.abs(containerWidth - lastRenderedWidth) < 2) return;
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
			// Clear existing pages
			pagesContainer.innerHTML = '';

			for (let pageNum = 1; pageNum <= numPages; pageNum++) {
				if (currentToken !== renderToken) return;

				const page = await pdfDocument.getPage(pageNum);
				const baseViewport = page.getViewport({ scale: 1 });
				
				// Calculate scale to fit container width (max 900px for readability)
				const targetWidth = Math.min(containerWidth, 900);
				const scale = targetWidth / baseViewport.width;
				const viewport = page.getViewport({ scale });

				// Create page wrapper
				const pageWrapper = document.createElement('div');
				pageWrapper.className = 'pdf-page';
				pageWrapper.style.width = `${viewport.width}px`;
				pageWrapper.style.height = `${viewport.height}px`;
				pageWrapper.style.position = 'relative';
				pageWrapper.style.marginBottom = '8px';

				// Create canvas with high-DPI support
				const canvas = document.createElement('canvas');
				canvas.style.width = `${viewport.width}px`;
				canvas.style.height = `${viewport.height}px`;
				canvas.style.display = 'block';
				
				// Scale canvas for high-DPI displays
				canvas.width = Math.floor(viewport.width * pixelRatio);
				canvas.height = Math.floor(viewport.height * pixelRatio);

				const context = canvas.getContext('2d');
				if (context) {
					// Scale context for high-DPI
					context.scale(pixelRatio, pixelRatio);

					await page.render({
						canvasContext: context,
						viewport,
						canvas
					}).promise;
				}

				if (currentToken !== renderToken) return;

				pageWrapper.appendChild(canvas);
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
		<div class="error-state">
			<div class="space-y-4">
				<p>Error loading PDF. Disable extensions like IDM and try again.</p>
				<button class="retry-btn" onclick={retry}>
					Retry
				</button>
			</div>
		</div>
	{:else if isLoading && !pdfBlobUrl}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading PDF...</p>
		</div>
	{:else}
		<div class="pages-scroll-area">
			{#if isRendering}
				<div class="rendering-overlay">
					<div class="spinner"></div>
					<p>Rendering...</p>
				</div>
			{/if}
			<div 
				class="pages-container" 
				class:invisible={isRendering}
				{@attach pagesContainerAttachment}
			></div>
		</div>
	{/if}
</div>

<style>
	.pdf-viewer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.error-state,
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		text-align: center;
		gap: 1rem;
	}

	.retry-btn {
		padding: 0.5rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: border-color 0.2s;
		cursor: pointer;
		background: transparent;
		color: inherit;
	}

	.retry-btn:hover {
		border-color: rgba(255, 255, 255, 0.4);
	}

	.pages-scroll-area {
		position: relative;
		flex: 1;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.pages-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 0;
	}

	.pages-container.invisible {
		visibility: hidden;
	}

	.rendering-overlay {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
	}

	.spinner {
		width: 32px;
		height: 32px;
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

	/* Ensure crisp rendering on high-DPI */
	:global(.pdf-page canvas) {
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
	}
</style>
