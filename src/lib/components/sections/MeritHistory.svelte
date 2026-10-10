<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { meritEntries } from '$lib/state/merit-entries.svelte';
	import { formatVnd } from '$lib/utils/money';

	const locale = getLocale();
	const entries = $derived(meritEntries());
</script>

<section class="flex min-w-0 flex-[1.6_1_460px] flex-col gap-3">
	<h2 class="font-serif text-[22px] font-medium">{m.mr_history_title()}</h2>
	<ul class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
		{#each entries as e, i (e.id)}
			<li
				class="flex flex-wrap items-center gap-4 px-[22px] py-4 {i < entries.length - 1
					? 'border-b border-ink/7'
					: ''}"
			>
				<div class="w-12 flex-none text-center">
					<div class="font-serif text-[22px]/none font-medium">
						{String(e.date[0]).padStart(2, '0')}
					</div>
					<div class="mt-[3px] text-[10.5px] font-medium text-ink/45">
						{m.mr_month({ month: e.date[1] })}
					</div>
				</div>
				<div class="min-w-[180px] flex-1">
					<div class="text-sm font-medium">{e.purpose()}</div>
					<div class="mt-0.5 text-xs text-ink/55">{e.temple()}</div>
				</div>
				<div class="text-end">
					<div class="text-[15px] font-medium">{formatVnd(e.amount, locale)}</div>
					<div
						class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium {e.confirmed
							? 'text-sage'
							: 'text-gold-deep'}"
					>
						<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
						{e.confirmed ? m.mr_status_confirmed() : m.mr_status_pending()}
					</div>
				</div>
			</li>
		{/each}
	</ul>
</section>
