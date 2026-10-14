<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { daysBetween, parseIsoDate } from '$lib/utils/events';
	import EventsHeader from '$lib/components/sections/EventsHeader.svelte';
	import EventsNext from '$lib/components/sections/EventsNext.svelte';
	import EventsGroups from '$lib/components/sections/EventsGroups.svelte';

	let { data }: PageProps = $props();

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	// Starts with the first loaded year (Jan–Dec); "load more" reveals the following one.
	let loadedYears = $state(1);
	let tab = $state('all');

	const shownYears = $derived(data.years.slice(0, loadedYears));
	const lastYear = $derived(shownYears.at(-1));
	const canLoadMore = $derived(loadedYears < data.years.length);
	const yearsLabel = $derived(
		shownYears.length > 1 ? `${shownYears[0]}–${lastYear}` : `${shownYears[0] ?? ''}`
	);

	const all = $derived(
		data.items.filter((e) => shownYears.includes(Number(e.solar_date.slice(0, 4))))
	);
	const tabs = $derived([
		{ id: 'all', label: m.ev_tab_all() },
		...data.groups.map((g) => ({ id: g.code, label: g.name }))
	]);
	const counts = $derived(
		Object.fromEntries(
			tabs.map((t) => [
				t.id,
				t.id === 'all' ? all.length : all.filter((e) => e.groups.includes(t.id)).length
			])
		)
	);
	const visible = $derived(
		all
			.filter((e) => tab === 'all' || e.groups.includes(tab))
			.map((item) => ({ item, daysLeft: daysBetween(today, parseIsoDate(item.solar_date)) }))
	);
	const next = $derived(visible.find((e) => e.daysLeft >= 0));
	const groupNames = $derived(new Map(data.groups.map((g) => [g.code, g.name])));
</script>

<svelte:head>
	<title>{m.ev_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.ev_meta_description()} />
</svelte:head>

{#if data.state !== 'ok'}
	<div class="flex flex-col items-start gap-4">
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.ev_meta_title()}</h1>
		<p class="rounded-[22px] border border-ink/8 bg-paper px-6 py-10 text-sm text-ink/55">
			{data.state === 'guest' ? m.ev_guest() : m.ev_unavailable()}
		</p>
	</div>
{:else}
	<div class="flex flex-col gap-7">
		<EventsHeader bind:tab {tabs} years={yearsLabel} total={all.length} {counts} />
		{#if next}
			<EventsNext item={next.item} daysLeft={next.daysLeft} />
		{/if}
		<EventsGroups events={visible} {groupNames} />
		{#if canLoadMore && lastYear}
			<button
				type="button"
				onclick={() => loadedYears++}
				class="mx-auto cursor-pointer rounded-full border border-ink/14 bg-paper px-6 py-3 text-sm font-medium text-ink/70 transition-colors hover:bg-white"
			>
				{m.ev_load_more({ year: lastYear + 1 })}
			</button>
		{/if}
	</div>
{/if}
