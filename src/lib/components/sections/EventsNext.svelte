<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { CalendarListItem } from '$lib/types/calendar';
	import { countdownText, lunarDateText, monthShort, parseIsoDate } from '$lib/utils/events';
	import type { CountdownLabel } from '$lib/utils/events';

	interface Props {
		item: CalendarListItem;
		cd: { days: number; label: CountdownLabel };
	}

	let { item, cd }: Props = $props();

	const date = $derived(parseIsoDate(item.solar_date));

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
			{date.getDate()}
		</p>
		<p class="mt-1.5 text-xs font-medium tracking-[.12em] text-[#f5eee0]/60 uppercase">
			{monthShort(date)}
		</p>
	</div>
	<div class="relative min-w-0 flex-[1_1_280px]">
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-[#e8b061]">
			{m.ev_next_label({ left: countdownText(cd) })}
		</p>
		<h2 class="mt-2 font-serif text-[28px]/tight font-medium text-pretty">{item.name}</h2>
		<p class="mt-2 text-[13px] text-[#f5eee0]/70">
			{weekdayFull.format(date)} · {lunarDateText(item.lunar_date)}
		</p>
	</div>
</div>
