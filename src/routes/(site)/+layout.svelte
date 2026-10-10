<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import SiteFooter from '$lib/components/layout/SiteFooter.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="min-h-screen bg-cream font-sans text-ink">
	<SiteHeader user={data.user} />
	<main class="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,4vw,40px)] pb-20">
		{@render children()}
	</main>
	<SiteFooter />
	<BottomNav />
</div>
