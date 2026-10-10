<script lang="ts">
	import type { Pathname } from '$app/types';
	import { onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { CUSTOM_TRANSITION_ROUTES } from '$lib/config/transitions';
	import OfflineGate from '$lib/components/layout/OfflineGate.svelte';

	// Preload the above-the-fold font files so text isn't first painted in a fallback font (FOUT jump).
	import beLatin400 from '@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-400-normal.woff2?url';
	import beLatin500 from '@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-500-normal.woff2?url';
	import beVi400 from '@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-400-normal.woff2?url';
	import beVi500 from '@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-500-normal.woff2?url';
	import cgLatin500 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2?url';
	import cgVi500 from '@fontsource/cormorant-garamond/files/cormorant-garamond-vietnamese-500-normal.woff2?url';

	const PRELOADED_FONTS = [beLatin400, beLatin500, beVi400, beVi500, cgLatin500, cgVi500];

	let { children } = $props();

	// Default page transition: crossfade (View Transitions API), unless either route has its own effect.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const custom = [navigation.from?.route.id, navigation.to?.route.id].some(
			(id) => id && CUSTOM_TRANSITION_ROUTES.includes(id)
		);
		if (custom) return;

		return new Promise((done) => {
			document.startViewTransition(async () => {
				done();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#each PRELOADED_FONTS as href (href)}
		<link rel="preload" as="font" type="font/woff2" {href} crossorigin="anonymous" />
	{/each}
</svelte:head>
{@render children()}
<OfflineGate />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
