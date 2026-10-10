<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { EVENT_KINDS, type BuddhistEvent } from '$lib/content/events';
	import { LUNAR_MONTHS } from '$lib/content/home';
	import { leftLabel, monthShort } from '$lib/utils/events';

	interface Props {
		events: { event: BuddhistEvent; daysLeft: number }[];
	}

	let { events }: Props = $props();

	const weekdayDate = new Intl.DateTimeFormat(getLocale(), {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	});

	// Events arrive sorted by date, which keeps each lunar month contiguous.
	const groups = $derived.by(() => {
		const out: { month: number; items: typeof events }[] = [];
		for (const e of events) {
			let g = out.find((x) => x.month === e.event.lunarMonth);
			if (!g) out.push((g = { month: e.event.lunarMonth, items: [] }));
			g.items.push(e);
		}
		return out;
	});
</script>

{#if groups.length === 0}
	<p class="rounded-[22px] border border-ink/8 bg-paper px-6 py-10 text-center text-sm text-ink/55">
		{m.ev_empty()}
	</p>
{:else}
	<div class="flex flex-col gap-[26px]">
		{#each groups as g (g.month)}
			<section
				aria-labelledby="ev-month-{g.month}"
				class="grid gap-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)] md:gap-5"
			>
				<div class="md:pt-3.5">
					<h2 id="ev-month-{g.month}" class="font-serif text-[22px] font-medium">
						{m.ev_month_title({ month: LUNAR_MONTHS[g.month - 1]() })}
					</h2>
					<p class="mt-1 text-xs text-ink/50">{m.ev_month_count({ count: g.items.length })}</p>
				</div>
				<ul class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1">
					{#each g.items as { event: e, daysLeft } (e.date.getTime() + e.name)}
						{@const kind = EVENT_KINDS[e.kind]}
						<li
							class="flex flex-wrap items-center gap-x-[18px] gap-y-2 border-b border-ink/6 py-[15px] last:border-b-0 {daysLeft <
							0
								? 'opacity-50'
								: ''}"
						>
							<div class="w-[52px] flex-none text-center">
								<p class="font-serif text-[28px]/none font-medium">
									{String(e.date.getDate()).padStart(2, '0')}
								</p>
								<p class="mt-1 text-[10.5px] font-medium text-ink/45 uppercase">
									{monthShort(e.date)}
								</p>
							</div>
							<span class="w-1 self-stretch rounded-sm {kind.bar}" aria-hidden="true"></span>
							<div class="min-w-0 flex-[1_1_180px]">
								<p class="text-[15px] font-medium {kind.name}">{e.name}</p>
								<p class="mt-1 text-xs text-ink/50">
									{weekdayDate.format(e.date)} · {m.ev_lunar_date({
										day: e.lunarDay,
										month: e.lunarMonth
									})}
								</p>
							</div>
							<span
								class="rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap {kind.tag}"
							>
								{kind.label()}
							</span>
							<p class="min-w-[78px] text-right text-xs font-medium whitespace-nowrap text-ink/50">
								{leftLabel(daysLeft)}
							</p>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
