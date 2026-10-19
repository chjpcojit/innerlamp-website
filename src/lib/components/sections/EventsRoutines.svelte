<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { ROUTINES } from '$lib/content/home';
	import type { HomeBlockMonth } from '$lib/types/calendar';
	import { lunarDateText } from '$lib/utils/events';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	interface Props {
		/** The current month's card of the Buddhist events block (BR-CAL-15) and whether it came from an old copy. */
		events: { month: HomeBlockMonth; stale: boolean };
	}

	let { events }: Props = $props();
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
		{#if events.stale}
			<p class="mb-3 text-[13px] text-ink/55" role="status">{m.ev_stale_note()}</p>
		{/if}
		<div class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1.5">
			{#if events.month.failed}
				<div class="flex flex-wrap items-center gap-3 py-4">
					<p class="text-sm text-ink/50">{m.events_unavailable()}</p>
					<button
						type="button"
						onclick={() => invalidateAll()}
						class="cursor-pointer rounded-full border border-ink/14 px-4 py-1.5 text-[13px] font-medium text-ink/70 transition-colors hover:bg-white"
					>
						{m.ev_retry()}
					</button>
				</div>
			{:else if events.month.shown.length === 0 && events.month.more === 0}
				<p class="py-4 text-sm text-ink/50">{m.events_month_none()}</p>
			{:else}
				<ul>
					{#each events.month.shown as e (`${e.code}-${e.solar_date}`)}
						<li class="border-b border-ink/6 last:border-b-0">
							<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
							<a
								href={localizeHref(`/events/${encodeURIComponent(e.code)}?date=${e.solar_date}`)}
								class="flex items-center gap-[18px] py-3.5"
							>
								<span class="w-[52px] text-center">
									<span class="block font-serif text-[22px]/none">{e.solar_date.slice(8, 10)}</span>
									<span class="mt-[3px] block text-[10.5px] font-medium text-ink/45">
										{m.events_month_short({ month: Number(e.solar_date.slice(5, 7)) })}
									</span>
								</span>
								<span class="min-w-0 flex-1">
									<span
										class="block text-sm font-medium {e.is_public_holiday ? 'text-gold-deep' : ''}"
										>{e.name}</span
									>
									<span class="mt-[3px] block text-xs text-ink/50">
										{lunarDateText(e.lunar_date)}
									</span>
								</span>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</li>
					{/each}
				</ul>
				{#if events.month.more > 0}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a
						href={localizeHref('/events')}
						class="flex items-center justify-center gap-1.5 py-3.5 text-[13px] font-medium text-gold-deep transition-colors hover:text-ink"
					>
						{m.events_more_others({ count: events.month.more })}
						<span class="text-[15px]" aria-hidden="true">›</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/if}
			{/if}
		</div>
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
