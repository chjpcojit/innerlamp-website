<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { theme } from '$lib/state/theme.svelte';

	onMount(() => theme.init());

	const label = $derived(theme.dark ? m.header_theme_to_light() : m.header_theme_to_dark());
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	aria-label={label}
	title={label}
	class="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border border-ink/12 text-[#4a443c] transition-colors hover:bg-sand"
>
	{#if theme.dark}
		<svg
			viewBox="0 0 24 24"
			class="size-[18px]"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
			/>
		</svg>
	{:else}
		<svg
			viewBox="0 0 24 24"
			class="size-[18px]"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
		</svg>
	{/if}
</button>
