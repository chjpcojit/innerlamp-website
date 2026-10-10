<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { PROFILE_STATS } from '$lib/content/profile';

	const stats = [
		{ value: PROFILE_STATS.hours, label: () => m.pf_stat_hours() },
		{ value: PROFILE_STATS.streakDays, label: () => m.pf_stat_streak() },
		{ value: PROFILE_STATS.chants, label: () => m.pf_stat_chants() }
	];
</script>

<dl
	class="flex rounded-[22px] border border-ink/8 bg-paper py-[22px]"
	aria-label={m.pf_stats_aria()}
>
	{#each stats as s, i (i)}
		<div class="flex-1 px-2 text-center {i > 0 ? 'border-s border-ink/9' : ''}">
			<dd class="order-first text-[28px] font-medium">{s.value}</dd>
			<dt class="mt-1 text-xs text-ink/50">{s.label()}</dt>
		</div>
	{/each}
</dl>
