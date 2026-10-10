<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'solid' | 'outline';
		busy?: boolean;
		onclick: () => void;
		children: Snippet;
	}

	let { variant = 'solid', busy = false, onclick, children }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	disabled={busy}
	class="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full px-6 py-[13px] text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-default {variant ===
	'solid'
		? 'bg-ink text-cream hover:bg-[#3a342c]'
		: 'border border-ink/18 hover:bg-sand/60'}"
>
	{#if busy}
		<span
			class="size-[13px] animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
