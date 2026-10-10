<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { buildYearEvents, EVENT_TABS } from '$lib/content/events';
	import { daysBetween } from '$lib/utils/events';
	import { solarToLunar } from '$lib/utils/lunar';
	import EventsHeader from '$lib/components/sections/EventsHeader.svelte';
	import EventsNext from '$lib/components/sections/EventsNext.svelte';
	import EventsGroups from '$lib/components/sections/EventsGroups.svelte';

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	let year = $state(solarToLunar(today).year);
	let tab = $state('all');

	const all = $derived(buildYearEvents(year));
	const counts = $derived(
		Object.fromEntries(
			EVENT_TABS.map((t) => [
				t.id,
				all.filter((e) => t.kinds === null || t.kinds.includes(e.kind)).length
			])
		)
	);
	const visible = $derived.by(() => {
		const kinds = EVENT_TABS.find((t) => t.id === tab)?.kinds ?? null;
		return all
			.filter((e) => kinds === null || kinds.includes(e.kind))
			.map((event) => ({ event, daysLeft: daysBetween(today, event.date) }));
	});
	const next = $derived(visible.find((e) => e.daysLeft >= 0));
</script>

<svelte:head>
	<title>{m.ev_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.ev_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-7">
	<EventsHeader bind:year bind:tab total={all.length} {counts} />
	{#if next}
		<EventsNext event={next.event} daysLeft={next.daysLeft} />
	{/if}
	<EventsGroups events={visible} />
</div>
