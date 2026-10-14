<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { CalendarListItem } from '$lib/types/calendar';
	import { leftLabel, monthShort, parseIsoDate } from '$lib/utils/events';

	interface Props {
		events: { item: CalendarListItem; daysLeft: number }[];
		/** Backend group code → display name, for the row tag. */
		groupNames: Map<string, string>;
	}

	let { events, groupNames }: Props = $props();

	const weekdayDate = new Intl.DateTimeFormat(getLocale(), {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	});

	// Events arrive sorted by date, which keeps each Gregorian month contiguous.
	const groups = $derived.by(() => {
		const out: {
			key: string;
			year: number;
			month: number;
			items: { item: CalendarListItem; date: Date; daysLeft: number }[];
		}[] = [];
		for (const { item, daysLeft } of events) {
			const date = parseIsoDate(item.solar_date);
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const key = `${year}-${month}`;
			let g = out.find((x) => x.key === key);
			if (!g) out.push((g = { key, year, month, items: [] }));
			g.items.push({ item, date, daysLeft });
		}
		return out;
	});

	// Runs after SvelteKit's own scroll handling (reset to top on navigation), so the jump sticks.
	// Brings the current month (or the next one that has events) into view.
	afterNavigate(() => {
		const now = new Date();
		const current = now.getFullYear() * 12 + now.getMonth();
		const target = groups.find((g) => g.year * 12 + g.month - 1 >= current);
		if (!target || target === groups[0]) return;
		document.getElementById(`ev-month-${target.key}`)?.closest('section')?.scrollIntoView();
	});
</script>

{#if groups.length === 0}
	<p class="rounded-[22px] border border-ink/8 bg-paper px-6 py-10 text-center text-sm text-ink/55">
		{m.ev_empty()}
	</p>
{:else}
	<div class="flex flex-col gap-[26px]">
		{#each groups as g (g.key)}
			<section
				aria-labelledby="ev-month-{g.key}"
				class="grid scroll-mt-28 gap-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)] md:gap-5"
			>
				<div class="md:pt-3.5">
					<h2 id="ev-month-{g.key}" class="font-serif text-[22px] font-medium">
						{m.ev_month_title({ month: g.month, year: g.year })}
					</h2>
					<p class="mt-1 text-xs text-ink/50">{m.ev_month_count({ count: g.items.length })}</p>
				</div>
				<ul class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1">
					{#each g.items as { item: e, date, daysLeft } (`${e.code}-${e.solar_date}`)}
						{@const tag = groupNames.get(e.groups[0] ?? '')}
						<li class="border-b border-ink/6 last:border-b-0 {daysLeft < 0 ? 'opacity-50' : ''}">
							<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
							<a
								href={localizeHref(`/events/${encodeURIComponent(e.code)}?date=${e.solar_date}`)}
								class="flex flex-wrap items-center gap-x-[18px] gap-y-2 py-[15px] transition-colors hover:bg-sand/30"
							>
								<div class="w-[52px] flex-none text-center">
									<p class="font-serif text-[28px]/none font-medium">
										{String(date.getDate()).padStart(2, '0')}
									</p>
									<p class="mt-1 text-[10.5px] font-medium text-ink/45 uppercase">
										{monthShort(date)}
									</p>
								</div>
								<span
									class="w-1 self-stretch rounded-sm {e.is_public_holiday
										? 'bg-gold'
										: 'bg-sand-deep'}"
									aria-hidden="true"
								></span>
								<div class="min-w-0 flex-[1_1_180px]">
									<p class="text-[15px] font-medium {e.is_public_holiday ? 'text-gold-deep' : ''}">
										{e.name}
									</p>
									<p class="mt-1 text-xs text-ink/50">
										{weekdayDate.format(date)} · {m.ev_lunar_date({
											day: e.lunar_date.day,
											month: e.lunar_date.month
										})}
									</p>
								</div>
								{#if tag}
									<span
										class="rounded-full bg-ink/6 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-ink/60"
									>
										{tag}
									</span>
								{/if}
								<p
									class="min-w-[78px] text-right text-xs font-medium whitespace-nowrap text-ink/50"
								>
									{leftLabel(daysLeft)}
								</p>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
