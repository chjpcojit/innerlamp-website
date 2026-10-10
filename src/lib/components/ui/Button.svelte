<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		href: Pathname;
		variant?: 'solid' | 'outline' | 'gold';
		children: Snippet;
	}

	let { href, variant = 'solid', children }: Props = $props();

	const styles = {
		solid: 'bg-ink text-cream hover:bg-[#3a342c]',
		outline: 'border border-ink/20 hover:bg-sand/60',
		gold: 'border border-gold/50 bg-paper text-gold-deep hover:bg-[#fbf3e4]'
	};
</script>

<a
	href={resolve(localizeHref(href) as Pathname)}
	class="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors {styles[
		variant
	]}"
>
	{@render children()}
</a>
