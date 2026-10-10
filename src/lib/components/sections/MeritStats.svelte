<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { MERIT_YEAR } from '$lib/content/merit';
	import { meritEntries } from '$lib/state/merit-entries.svelte';
	import { formatVnd } from '$lib/utils/money';

	const locale = getLocale();
	const entries = $derived(meritEntries());
	const yearEntries = $derived(entries.filter((e) => e.date[2] === MERIT_YEAR));
	const total = $derived(yearEntries.reduce((sum, e) => sum + e.amount, 0));

	const stats = $derived([
		{
			label: m.mr_stat_total({ year: MERIT_YEAR }),
			value: formatVnd(total, locale),
			sub: m.mr_stat_total_sub({ count: yearEntries.length })
		},
		{
			label: m.mr_stat_lamps(),
			value: String(entries.filter((e) => e.lamp).length),
			sub: m.mr_stat_lamps_sub()
		},
		{
			label: m.mr_stat_temples(),
			value: String(new Set(entries.map((e) => e.temple())).size),
			sub: m.mr_stat_temples_sub()
		}
	]);
</script>

<dl
	class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] rounded-[22px] border border-ink/8 bg-paper"
	aria-label={m.mr_stats_aria()}
>
	{#each stats as s, i (i)}
		<div class="px-6 py-5 {i > 0 ? 'border-s border-ink/7' : ''}">
			<dt class="text-[10.5px] font-semibold tracking-[.14em] text-ink/45 uppercase">
				{s.label}
			</dt>
			<dd class="mt-1.5 font-serif text-[28px] font-medium">{s.value}</dd>
			<dd class="mt-0.5 text-xs text-ink/50">{s.sub}</dd>
		</div>
	{/each}
</dl>
