<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		/** Right-aligned slot, e.g. a search field. */
		children?: Snippet;
	}

	let { title, subtitle, children }: Props = $props();
</script>

<div class="flex flex-wrap items-end justify-between gap-5">
	<div>
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight">{title}</h1>
		{#if subtitle}<p class="mt-2 text-sm text-ink/55" aria-live="polite">{subtitle}</p>{/if}
	</div>
	{@render children?.()}
</div>
