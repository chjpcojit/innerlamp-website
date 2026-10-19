<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import type { CalendarGroup, CalendarListItem } from '$lib/types/calendar';
	import { countdown, localIsoToday } from '$lib/utils/events';
	import EventsHeader from '$lib/components/sections/EventsHeader.svelte';
	import EventsNext from '$lib/components/sections/EventsNext.svelte';
	import EventsGroups from '$lib/components/sections/EventsGroups.svelte';

	let { data }: PageProps = $props();

	/** Last year the calendar can be browsed to (FR-CAL-004). */
	const MAX_YEAR = 2100;

	// The countdown counts on the device date (BR-CAL-13), so it exists only after mount.
	let today = $state('');
	onMount(() => (today = localIsoToday()));

	// Years appended by "load more" on top of the year `load` returned.
	let extra = $state<{ year: number; groups: CalendarGroup[]; items: CalendarListItem[] }[]>([]);
	let more = $state<'idle' | 'loading' | 'failed' | 'offline'>('idle');
	let moreStale = $state(false);
	let tab = $state('all');

	const lastYear = $derived(extra.at(-1)?.year ?? data.year);
	const canLoadMore = $derived(lastYear < MAX_YEAR);
	const yearsLabel = $derived(extra.length > 0 ? `${data.year}–${lastYear}` : `${data.year}`);
	const stale = $derived(data.stale || moreStale);

	const all = $derived([...data.items, ...extra.flatMap((e) => e.items)]);
	const groups = $derived.by(() => {
		const out: CalendarGroup[] = [];
		for (const g of [...data.groups, ...extra.flatMap((e) => e.groups)])
			if (!out.some((x) => x.code === g.code)) out.push(g);
		return out;
	});
	const tabs = $derived([
		{ id: 'all', label: m.ev_tab_all() },
		{ id: 'major', label: m.ev_tab_major() },
		...groups.map((g) => ({ id: g.code, label: g.name }))
	]);
	const matches = (e: CalendarListItem, id: string) =>
		id === 'all' || (id === 'major' ? e.is_major : e.groups.includes(id));
	const counts = $derived(
		Object.fromEntries(tabs.map((t) => [t.id, all.filter((e) => matches(e, t.id)).length]))
	);
	const visible = $derived(
		all
			.filter((e) => matches(e, tab))
			.map((item) => ({ item, cd: today ? countdown(today, item.solar_date) : null }))
	);
	const next = $derived(visible.find((e) => e.cd && e.cd.days >= 0));
	const groupNames = $derived(new Map(groups.map((g) => [g.code, g.name])));

	async function loadMore() {
		if (more === 'loading') return;
		const year = lastYear + 1;
		more = 'loading';
		try {
			const res = await fetch(`/api/calendar/year?year=${year}`);
			if (!res.ok) throw new Error(String(res.status));
			const loaded = (await res.json()) as {
				year: number;
				groups: CalendarGroup[];
				items: CalendarListItem[];
				stale: boolean;
			};
			extra.push({ year: loaded.year, groups: loaded.groups, items: loaded.items });
			moreStale ||= loaded.stale;
			more = 'idle';
		} catch {
			more = navigator.onLine === false ? 'offline' : 'failed';
		}
	}

	const button =
		'cursor-pointer rounded-full border border-ink/14 bg-paper px-6 py-3 text-sm font-medium text-ink/70 transition-colors hover:bg-white disabled:cursor-default disabled:opacity-60';
</script>

<svelte:head>
	<title>{m.ev_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.ev_meta_description()} />
</svelte:head>

{#if data.state !== 'ok'}
	<div class="flex flex-col items-start gap-4">
		<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">{m.ev_meta_title()}</h1>
		<p class="rounded-[22px] border border-ink/8 bg-paper px-6 py-10 text-sm text-ink/55">
			{m.ev_unavailable()}
		</p>
		<button type="button" onclick={() => invalidateAll()} class={button}>{m.ev_retry()}</button>
	</div>
{:else}
	<div class="flex flex-col gap-7">
		<EventsHeader bind:tab {tabs} years={yearsLabel} total={all.length} {counts} />
		{#if stale}
			<p class="text-[13px] text-ink/55" role="status">{m.ev_stale_note()}</p>
		{/if}
		{#if next?.cd}
			<EventsNext item={next.item} cd={next.cd} />
		{/if}
		<EventsGroups events={visible} {groupNames} />
		{#if more === 'failed' || more === 'offline'}
			<p class="text-center text-[13px] text-ink/55" role="alert">
				{more === 'offline' ? m.ev_offline() : m.ev_load_more_failed({ year: lastYear + 1 })}
			</p>
		{/if}
		{#if canLoadMore}
			<button
				type="button"
				onclick={loadMore}
				disabled={more === 'loading'}
				class="mx-auto {button}"
			>
				{more === 'failed' || more === 'offline'
					? m.ev_retry()
					: m.ev_load_more({ year: lastYear + 1 })}
			</button>
		{/if}
	</div>
{/if}
