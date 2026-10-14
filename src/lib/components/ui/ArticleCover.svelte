<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	interface Props {
		/** Original image (hotlinked from the source site; may fail to load). */
		src: string | null;
		/** Small backend-hosted fallback used when `src` is missing or fails. */
		fallback: string | null;
		/** Aspect ratio + rounding classes, e.g. `aspect-4/3`. */
		ratio: string;
		eager?: boolean;
	}

	let { src, fallback, ratio, eager = false }: Props = $props();

	let failed = $state(false);
	const url = $derived((failed ? fallback : (src ?? fallback)) ?? null);
</script>

<div
	class="relative overflow-hidden rounded-[18px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] {ratio}"
>
	{#if url}
		<img
			src={url}
			alt=""
			loading={eager ? 'eager' : 'lazy'}
			referrerpolicy="no-referrer"
			class="size-full object-cover"
			onerror={() => {
				if (!failed && fallback && url !== fallback) failed = true;
			}}
		/>
	{:else}
		<span
			class="flex size-full items-center justify-center font-mono text-[10.5px] text-ink/40"
			aria-hidden="true"
		>
			{m.article_photo_label()}
		</span>
	{/if}
</div>
