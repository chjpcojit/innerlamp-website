<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { ROUTINES } from '$lib/content/home';
	import type { CalendarListItem } from '$lib/types/calendar';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	interface Props {
		/** This month's Buddhist events; `null` when guest or the backend failed. */
		events: CalendarListItem[] | null;
		isGuest: boolean;
	}

	let { events, isGuest }: Props = $props();

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const DAY_MS = 86_400_000;
	/** Rows shown before collapsing the rest into a "+n events" link. */
	const MAX_VISIBLE = 5;

	const items = $derived(
		(events ?? []).map((e) => {
			const [year, month, day] = e.solar_date.split('-').map(Number);
			const date = new Date(year, month - 1, day);
			return {
				item: e,
				day,
				month,
				daysLeft: Math.round((date.getTime() - startOfToday.getTime()) / DAY_MS)
			};
		})
	);

	// Over the cap, start at the first upcoming event so past days don't take the slots.
	const visible = $derived.by(() => {
		if (items.length <= MAX_VISIBLE) return items;
		const firstUpcoming = items.findIndex((i) => i.daysLeft >= 0);
		const from = Math.min(
			firstUpcoming === -1 ? items.length : firstUpcoming,
			items.length - MAX_VISIBLE
		);
		return items.slice(from, from + MAX_VISIBLE);
	});
	const hiddenCount = $derived(items.length - visible.length);
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-7">
	<section id="events" class="scroll-mt-24" aria-labelledby="events-title">
		<SectionHeading
			id="events-title"
			title={m.events_title()}
			href="/events"
			linkLabel={m.events_view_all()}
			icon="wheel"
		/>
		{#if events === null || items.length === 0}
			<p class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-6 text-sm text-ink/50">
				{isGuest
					? m.events_guest()
					: events === null
						? m.events_unavailable()
						: m.events_month_empty()}
			</p>
		{:else}
			<ul class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1.5">
				{#each visible as { item: e, day, month, daysLeft } (`${e.code}-${e.solar_date}`)}
					<li class="border-b border-ink/6 last:border-b-0 {daysLeft < 0 ? 'opacity-50' : ''}">
						<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
						<a
							href={localizeHref(`/events/${encodeURIComponent(e.code)}?date=${e.solar_date}`)}
							class="flex items-center gap-[18px] py-3.5"
						>
							<span class="w-[52px] text-center">
								<span class="block font-serif text-[22px]/none">{String(day).padStart(2, '0')}</span
								>
								<span class="mt-[3px] block text-[10.5px] font-medium text-ink/45"
									>{m.events_month_short({ month })}</span
								>
							</span>
							<span class="min-w-0 flex-1">
								<span
									class="block text-sm font-medium {e.is_public_holiday ? 'text-gold-deep' : ''}"
									>{e.name}</span
								>
								<span class="mt-[3px] block text-xs text-ink/50"
									>{m.events_lunar_date({
										day: e.lunar_date.day,
										month: e.lunar_date.month
									})}</span
								>
							</span>
							{#if daysLeft >= 0}
								<span class="text-xs font-medium whitespace-nowrap text-ink/50">
									{daysLeft === 0 ? m.events_today() : m.events_days_left({ count: daysLeft })}
								</span>
							{/if}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
				{#if hiddenCount > 0}
					<li>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
						<a
							href={localizeHref('/events')}
							class="flex items-center justify-center gap-1.5 py-3.5 text-[13px] font-medium text-gold-deep transition-colors hover:text-ink"
						>
							{m.events_more({ count: hiddenCount })}
							<span class="text-[15px]" aria-hidden="true">›</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/if}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="routines-title">
		<SectionHeading id="routines-title" title={m.routines_title()} icon="routine" />
		<ul class="flex flex-col gap-2.5">
			{#each ROUTINES as r (r.title())}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a
						href={localizeHref('/practice')}
						class="flex items-center gap-3.5 rounded-[18px] border border-ink/8 bg-paper px-4 py-3.5 transition-colors hover:bg-white"
					>
						<Icon kind={r.icon} tone={r.tone} tint={r.tint} size={44} />
						<span class="min-w-0 flex-1">
							<span class="block text-[13px] font-medium">{r.title()}</span>
							<span class="mt-0.5 block text-xs text-ink/50">{r.sub()}</span>
						</span>
						<span class="text-base text-ink/35" aria-hidden="true">›</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>
	</section>
</div>
