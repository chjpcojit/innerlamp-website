<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import LampGarden from '$lib/features/lamp/components/LampGarden.svelte';
	import LampGuestIntro from '$lib/features/lamp/components/LampGuestIntro.svelte';
	import LampOffering from '$lib/features/lamp/components/LampOffering.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Scrolls to a section's heading on this page. / Cuộn tới tiêu đề một phần của trang. */
	function scrollTo(id: string) {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
	}
</script>

<svelte:head>
	<title>{m.lamp_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.lamp_meta_description()} />
</svelte:head>

{#if data.isGuest}
	<LampGuestIntro />
{:else}
	<div class="flex flex-col gap-6">
		<LampOffering onToGarden={() => scrollTo('lamp-garden')} />
		<LampGarden garden={data.garden} onToForm={() => scrollTo('lamp-title')} />
	</div>
{/if}
