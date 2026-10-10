<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { EVENT_TABS } from '$lib/content/events';
	import { canChiYear } from '$lib/utils/lunar';

	interface Props {
		year: number;
		/** Total events in the year, ignoring the filter. */
		total: number;
		counts: Record<string, number>;
		tab: string;
	}

	let { year = $bindable(), total, counts, tab = $bindable() }: Props = $props();

	const chip =
		'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink/70 hover:bg-white';
</script>

<div class="flex flex-col gap-7">
	<div class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">
				{m.ev_meta_title()}
			</h1>
			<p class="mt-2 text-sm text-ink/55">
				{m.ev_subtitle({ year: canChiYear(year), solar: year, count: total })}
			</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				type="button"
				aria-label={m.ev_prev_year()}
				onclick={() => year--}
				class="flex size-10 cursor-pointer items-center justify-center rounded-full border border-ink/14 text-ink/60 transition-colors hover:bg-sand/60"
			>
				<span aria-hidden="true">‹</span>
			</button>
			<p class="min-w-[110px] text-center font-serif text-[22px] font-medium whitespace-nowrap">
				{m.ev_year_label({ year: canChiYear(year) })}
			</p>
			<button
				type="button"
				aria-label={m.ev_next_year()}
				onclick={() => year++}
				class="flex size-10 cursor-pointer items-center justify-center rounded-full border border-ink/14 text-ink/60 transition-colors hover:bg-sand/60"
			>
				<span aria-hidden="true">›</span>
			</button>
		</div>
	</div>

	<div class="flex flex-wrap gap-2" role="group" aria-label={m.ev_filter_label()}>
		{#each EVENT_TABS as t (t.id)}
			<button
				type="button"
				class="{chip} {tab === t.id ? chipOn : chipOff}"
				aria-pressed={tab === t.id}
				onclick={() => (tab = t.id)}
			>
				{t.label()}
				<span class="opacity-60">{counts[t.id]}</span>
			</button>
		{/each}
	</div>
</div>
