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

<div class="flex h-full w-full select-none items-center justify-center md:justify-start">
	<Button onclick={openModal} class="w-3xs font-bold">View CV</Button>
</div>

<Modal bind:open={isModalOpen} maxWidth="4xl">
	{#snippet header()}
		<Button link={cvPDF}>Download CV</Button>
	{/snippet}

	<div class="h-[min(80vh,calc(100vh-8rem))] overflow-hidden bg-[rgb(var(--background))] px-1 pb-4 md:px-2 lg:px-4">
		<PDFViewer {cvPDF} />
	</div>
</Modal>
