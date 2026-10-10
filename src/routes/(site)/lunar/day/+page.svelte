<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import DayHero from '$lib/components/sections/DayHero.svelte';
	import DayOverview from '$lib/components/sections/DayOverview.svelte';
	import DayDetails from '$lib/components/sections/DayDetails.svelte';

	let { data }: PageProps = $props();

	const date = $derived.by(() => {
		const [y, mo, d] = data.date.split('-').map(Number);
		return new Date(y, mo - 1, d);
	});
</script>

<svelte:head>
	<title>{m.day_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.day_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-7">
	<DayHero {date} />
	<DayOverview {date} />
	<DayDetails {date} />
	<p class="text-xs text-ink/45">{m.lunar_disclaimer()}</p>
</div>
