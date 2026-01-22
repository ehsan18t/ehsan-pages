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

		// Handle initial resize
		handleResize();
		window.addEventListener('resize', handleResize);

		// Fetch PDF
		if (cvPDF.trim()) {
			await fetchPdf(cvPDF);
		}
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('resize', handleResize);
		if (pdfBlobUrl) {
			URL.revokeObjectURL(pdfBlobUrl);
		}
		if (pdfDocument) {
			pdfDocument.destroy();
		}
	});

	function handleResize() {
		if (containerRef) {
			containerWidth = containerRef.clientWidth;
		}
	}

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
			isRendering = true;

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

	async function renderAllPages() {
		if (!pdfDocument || !pagesContainer) return;

		// Clear existing pages - intentional DOM manipulation for PDF canvas rendering
		// eslint-disable-next-line svelte/no-dom-manipulating
		pagesContainer.innerHTML = '';

		for (let pageNum = 1; pageNum <= numPages; pageNum++) {
			const page = await pdfDocument.getPage(pageNum);
			const scale = Math.min(containerWidth, 900) / page.getViewport({ scale: 1 }).width;
			const viewport = page.getViewport({ scale });

			// Create canvas for this page
			const canvas = document.createElement('canvas');
			canvas.className = 'mb-1 block';
			canvas.width = viewport.width;
			canvas.height = viewport.height;

			const context = canvas.getContext('2d');
			if (context) {
				await page.render({
					canvasContext: context,
					viewport,
					canvas
				}).promise;
			}

			// Intentional DOM manipulation for PDF canvas rendering
			// eslint-disable-next-line svelte/no-dom-manipulating
			pagesContainer.appendChild(canvas);
		}
	}

	async function retry() {
		if (cvPDF.trim()) {
			await fetchPdf(cvPDF);
		}
	}

	// Re-render when container width changes significantly
	$effect(() => {
		if (pdfDocument && containerWidth && pagesContainer) {
			renderAllPages();
		}
	});
</script>

<div class="flex h-full w-full max-w-4xl flex-col" bind:this={containerRef}>
	{#if error}
		<div class="flex h-full w-full items-center justify-center text-center">
			<div class="space-y-4">
				<p>Error loading PDF. Disable extensions like IDM and try again.</p>
				<button
					class="rounded-md border border-white/20 px-3 py-2 text-sm transition-colors hover:border-white/40"
					onclick={retry}
				>
					Retry
				</button>
			</div>
		</div>
	{:else if isLoading && !pdfBlobUrl}
		<div class="flex h-full w-full items-center justify-center text-center">
			<p>Loading PDF...</p>
		</div>
	{:else}
		<div class="relative flex-1 overflow-x-hidden overflow-y-auto">
			{#if isRendering}
				<div class="absolute inset-0 z-10 flex items-center justify-center">
					<p>Rendering PDF...</p>
				</div>
			{/if}
			<div class={isRendering ? 'invisible' : 'visible'} bind:this={pagesContainer}></div>
		</div>
	{/if}
</div>
