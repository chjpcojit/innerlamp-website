<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { JOURNAL_COLORS, JOURNAL_LEVELS } from '$lib/content/profile';
</script>

<section class="rounded-[22px] border border-ink/8 bg-paper p-[22px]">
	<div class="flex items-baseline justify-between gap-3">
		<h2 class="text-sm font-medium">{m.pf_journal_title()}</h2>
		<p class="text-xs text-ink/45">{m.pf_journal_count()}</p>
	</div>
	<div
		class="mt-4 grid grid-cols-[repeat(21,1fr)] gap-[5px]"
		role="img"
		aria-label={m.pf_journal_aria()}
	>
		{#each JOURNAL_LEVELS as level, i (i)}
			<div class="aspect-square rounded" style:background={JOURNAL_COLORS[level]}></div>
		{/each}
	</div>
</section>
