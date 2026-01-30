<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import Modal from '$components/ui/Modal.svelte';
	import PDFViewer from './PDFViewer.svelte';

	interface Props {
		cvPDF: string;
	}

	let { cvPDF }: Props = $props();

	let isModalOpen = $state(false);

	function openModal() {
		isModalOpen = true;
	}
</script>

<div class="contents">
	<Button onclick={openModal} class="cta-btn">View CV</Button>
</div>

<Modal bind:open={isModalOpen} maxWidth="4xl">
	{#snippet header()}
		<Button link={cvPDF}>Download CV</Button>
	{/snippet}

	<div class="pdf-container">
		<PDFViewer {cvPDF} />
	</div>
</Modal>

<style>
	.pdf-container {
		height: min(80vh, calc(100vh - 8rem));
		width: 100%;
		overflow: hidden;
		background: rgb(var(--background));
		padding: 0 0.25rem 1rem;
	}

	@media (min-width: 768px) {
		.pdf-container {
			padding: 0 0.5rem 1rem;
		}
	}

	@media (min-width: 1024px) {
		.pdf-container {
			padding: 0 1rem 1rem;
		}
	}
</style>
