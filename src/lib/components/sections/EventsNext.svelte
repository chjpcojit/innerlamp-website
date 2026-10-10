<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { BuddhistEvent } from '$lib/content/events';
	import { leftLabel, monthShort } from '$lib/utils/events';

	interface Props {
		event: BuddhistEvent;
		daysLeft: number;
	}

	let { event, daysLeft }: Props = $props();

	const weekdayFull = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'full' });
</script>

<div
	data-keep-dark
	class="relative flex flex-wrap items-center gap-7 overflow-hidden rounded-[26px] bg-linear-to-br from-[#2a2620] to-night px-8 py-[30px] text-[#f5eee0]"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_30%,rgba(217,150,60,.26),transparent)]"
		aria-hidden="true"
	></div>
	<div class="relative min-w-[90px] text-center">
		<p class="font-serif text-[clamp(48px,12vw,64px)]/none font-medium text-amber-light">
			{event.date.getDate()}
		</p>
		<p class="mt-1.5 text-xs font-medium tracking-[.12em] text-[#f5eee0]/60 uppercase">
			{monthShort(event.date)}
		</p>
	</div>
	<div class="relative min-w-0 flex-[1_1_280px]">
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-[#e8b061]">
			{m.ev_next_label({ left: leftLabel(daysLeft) })}
		</p>
		<h2 class="mt-2 font-serif text-[28px]/tight font-medium text-pretty">{event.name}</h2>
		<p class="mt-2 text-[13px] text-[#f5eee0]/70">
			{weekdayFull.format(event.date)} · {m.ev_lunar_date({
				day: event.lunarDay,
				month: event.lunarMonth
			})}
		</p>
	</div>
</div>
