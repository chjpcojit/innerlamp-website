<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PhotoItem } from '$lib/content/photos';

	interface Props {
		photos: PhotoItem[];
		/** Index into `photos`, or `null` when closed. */
		index: number | null;
	}

	let { photos, index = $bindable() }: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	const current = $derived(index === null ? undefined : photos[index]);

	$effect(() => {
		if (!dialog) return;
		if (index !== null && !dialog.open) dialog.showModal();
		else if (index === null && dialog.open) dialog.close();
	});

	function step(delta: number) {
		if (index === null) return;
		index = (index + delta + photos.length) % photos.length;
	}

	function onkeydown(e: KeyboardEvent) {
		if (index === null) return;
		if (e.key === 'ArrowLeft') step(-1);
		else if (e.key === 'ArrowRight') step(1);
	}

	const round =
		'flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#f5eee0]/30 text-xl text-[#f5eee0] transition-colors hover:bg-[#f5eee0]/12';
</script>

<svelte:window {onkeydown} />

<dialog
	bind:this={dialog}
	aria-label={m.gallery_lightbox_label()}
	onclose={() => (index = null)}
	class="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-night/92"
>
	<button
		type="button"
		class="absolute inset-0 cursor-default"
		aria-label={m.gallery_close()}
		onclick={() => (index = null)}
	></button>
	{#if current}
		<div
			class="pointer-events-none relative flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-8"
		>
			<div
				class="pointer-events-auto flex h-[min(70vh,720px)] w-[min(1100px,100%)] items-center justify-center rounded-[18px] bg-[repeating-linear-gradient(135deg,#2e2922_0_8px,#26211b_8px_16px)] font-mono text-[11px] text-[#f5eee0]/40"
				aria-hidden="true"
			>
				{m.photo_label()}
			</div>
			<div
				class="pointer-events-auto flex w-[min(1100px,100%)] flex-wrap items-center justify-between gap-4 text-[#f5eee0]"
			>
				<div class="min-w-0">
					<p class="font-serif text-[clamp(22px,5vw,28px)]">{current.name()}</p>
					<p class="mt-1 text-[13px] text-[#f5eee0]/65">{current.place()} · {current.caption()}</p>
				</div>
				<div class="flex items-center gap-2.5">
					<span class="text-xs font-medium whitespace-nowrap text-[#f5eee0]/60">
						{m.gallery_position({ current: (index ?? 0) + 1, total: photos.length })}
					</span>
					<button
						type="button"
						class={round}
						aria-label={m.gallery_prev()}
						onclick={() => step(-1)}
					>
						‹
					</button>
					<button type="button" class={round} aria-label={m.gallery_next()} onclick={() => step(1)}>
						›
					</button>
					<button
						type="button"
						class="{round} bg-[#f5eee0]/12 text-[15px]"
						aria-label={m.gallery_close()}
						onclick={() => (index = null)}
					>
						✕
					</button>
				</div>
			</div>
		</div>
	{/if}
</dialog>
