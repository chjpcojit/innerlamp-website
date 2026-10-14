<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import TempleEventList from './TempleEventList.svelte';
	import { SANGHA_POSTS } from '$lib/content/sangha';
	import type { TempleEventEntry } from '$lib/types/temple-event';
	import type { TempleScheduleItem } from '$lib/types/temple-schedule';

	interface Props {
		/** This month's events at the user's ordination temple. */
		events: TempleEventEntry[];
		/** The temple's weekly practice sessions. */
		schedule: TempleScheduleItem[];
	}

	let { events, schedule }: Props = $props();

	const WEEKDAYS = [
		() => m.weekday_short_0(),
		() => m.weekday_short_1(),
		() => m.weekday_short_2(),
		() => m.weekday_short_3(),
		() => m.weekday_short_4(),
		() => m.weekday_short_5(),
		() => m.weekday_short_6()
	];

	/** `04:30` → `4:30`, as in the design. */
	const shortTime = (hhmm: string) => hhmm.replace(/^0(?=\d:)/, '');

	interface ScheduleRow {
		key: string;
		time: string | null;
		title: string;
		when: string;
	}

	// Weekday sessions come from the schedule API; lunar-day ones (1st & 15th…) are
	// LUNAR_MONTHLY temple events, so they are taken from this month's events.
	const rows = $derived.by((): ScheduleRow[] => {
		const weekly = schedule.map((s) => ({
			key: `s-${s.id}`,
			time: shortTime(s.start_time),
			title: s.name,
			when: [
				s.weekdays.length === 0
					? m.sg_sched_daily()
					: m.sg_sched_weekly({ days: s.weekdays.map((d) => WEEKDAYS[d]?.() ?? d).join(', ') }),
				s.end_time ? m.sg_sched_until({ time: shortTime(s.end_time) }) : '',
				s.location
			]
				.filter(Boolean)
				.join(' · ')
		}));
		const lunar: ScheduleRow[] = [];
		for (const { event: e, starts_at } of events) {
			const { kind, lunar_days } = e.recurrence;
			const key = `e-${e.id}`;
			if (kind !== 'LUNAR_MONTHLY' || e.status === 'CANCELLED') continue;
			if (lunar.some((r) => r.key === key)) continue;
			lunar.push({
				key,
				// RFC 3339 already in Vietnam time (`…T19:00:00+07:00`).
				time: e.is_all_day ? null : shortTime(starts_at.slice(11, 16)),
				title: e.title,
				when: m.sg_sched_lunar({ days: lunar_days.join(', ') })
			});
		}
		return [...weekly, ...lunar];
	});

	let liked = $state<number[]>([]);

	const toggle = <T,>(list: T[], v: T) =>
		list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
</script>

<div class="flex min-w-0 flex-[2_1_520px] flex-col gap-7">
	<section
		aria-labelledby="sg-upcoming"
		class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
	>
		<h2 id="sg-upcoming" class="font-serif text-2xl">{m.sg_upcoming_title()}</h2>
		<TempleEventList entries={events} />
	</section>

	<section
		aria-labelledby="sg-schedule"
		class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
	>
		<h2 id="sg-schedule" class="font-serif text-2xl">{m.sg_schedule_title()}</h2>
		<p class="mt-1 text-[12.5px] text-ink/50">{m.sg_schedule_hint()}</p>
		{#if rows.length === 0}
			<p class="mt-3 text-sm text-ink/55">{m.sg_schedule_empty()}</p>
		{:else}
			<ul class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-2.5">
				{#each rows as r (r.key)}
					<li class="flex items-start gap-3.5 rounded-2xl bg-cream px-4 py-3.5">
						<p class="min-w-[52px] font-serif text-xl/tight text-gold-deep">
							{r.time ?? m.temple_ev_all_day()}
						</p>
						<div class="min-w-0">
							<p class="text-[13.5px] font-medium">{r.title}</p>
							<p class="mt-0.5 text-xs text-ink/52">{r.when}</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="sg-posts" class="flex flex-col gap-3.5">
		<h2 id="sg-posts" class="font-serif text-2xl">{m.sg_posts_title()}</h2>
		{#each SANGHA_POSTS as p (p.id)}
			{@const on = liked.includes(p.id)}
			<article class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]">
				<header class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-full font-serif text-[13px] text-ink"
						style:background-color={p.avatar}
						aria-hidden="true"
					>
						{p.initials}
					</div>
					<div>
						<p class="text-sm font-medium">{p.name}</p>
						<p class="mt-0.5 text-xs text-ink/50">{p.meta()}</p>
					</div>
				</header>
				<p class="mt-3.5 text-[15px]/[1.7] text-pretty text-ink/82">{p.body()}</p>
				<footer class="mt-4 flex gap-[22px] border-t border-ink/6 pt-3.5 text-[13px] font-medium">
					<button
						type="button"
						aria-pressed={on}
						onclick={() => (liked = toggle(liked, p.id))}
						class="flex cursor-pointer items-center gap-2 whitespace-nowrap {on
							? 'text-gold-deep'
							: 'text-ink/55'}"
					>
						<span
							class="size-3 -rotate-45 rounded-[50%_0_50%_50%] {on ? 'bg-amber' : 'bg-ink/25'}"
							aria-hidden="true"
						></span>
						{m.sg_like({ count: p.likes + (on ? 1 : 0) })}
					</button>
					<span class="whitespace-nowrap text-ink/55">{m.sg_reply({ count: p.replies })}</span>
				</footer>
			</article>
		{/each}
	</section>
</div>
