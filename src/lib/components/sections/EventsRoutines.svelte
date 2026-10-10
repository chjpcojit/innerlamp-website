<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { EVENTS, ROUTINES } from '$lib/content/home';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const DAY_MS = 86_400_000;

	const upcoming = EVENTS.map((e) => ({
		item: e,
		daysLeft: Math.round((e.date.getTime() - startOfToday.getTime()) / DAY_MS)
	})).filter((e) => e.daysLeft >= 0);
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
		<ul class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1.5">
			{#each upcoming as { item: e, daysLeft } (e.name())}
				<li class="border-b border-ink/6 last:border-b-0">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a href={localizeHref('/events')} class="flex items-center gap-[18px] py-3.5">
						<span class="w-[52px] text-center">
							<span class="block font-serif text-[22px]/none">{String(e.day).padStart(2, '0')}</span
							>
							<span class="mt-[3px] block text-[10.5px] font-medium text-ink/45">{e.month()}</span>
						</span>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-medium {e.highlight ? 'text-gold-deep' : ''}"
								>{e.name()}</span
							>
							<span class="mt-[3px] block text-xs text-ink/50">{e.detail()}</span>
						</span>
						<span class="text-xs font-medium whitespace-nowrap text-ink/50">
							{daysLeft === 0 ? m.events_today() : m.events_days_left({ count: daysLeft })}
						</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>
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
