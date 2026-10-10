<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		sub?: string;
		/** Right-hand control (toggle, segmented…). */
		children: Snippet;
	}

	let { title, sub, children }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-4 border-b border-ink/7 px-[22px] py-4 last:border-b-0">
	<div class="min-w-[200px] flex-1">
		<p class="text-sm font-medium">{title}</p>
		{#if sub}<p class="mt-0.5 text-xs/normal text-ink/52">{sub}</p>{/if}
	</div>
	{@render children()}
</div>
