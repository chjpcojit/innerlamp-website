<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	interface Props {
		/** Loaded year(s) label, e.g. "2026" or "2026–2027". */
		years: string;
		/** Total events loaded, ignoring the filter. */
		total: number;
		/** Filter tabs: "all" plus one per backend group. */
		tabs: { id: string; label: string }[];
		counts: Record<string, number>;
		tab: string;
	}

	let { years, total, tabs, counts, tab = $bindable() }: Props = $props();

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
				{m.ev_subtitle({ year: years, count: total })}
			</p>
		</div>
	</div>

	<div class="flex flex-wrap gap-2" role="group" aria-label={m.ev_filter_label()}>
		{#each tabs as t (t.id)}
			<button
				type="button"
				class="{chip} {tab === t.id ? chipOn : chipOff}"
				aria-pressed={tab === t.id}
				onclick={() => (tab = t.id)}
			>
				{t.label}
				<span class="opacity-60">{counts[t.id]}</span>
			</button>
		{/each}
	</div>
</div>
