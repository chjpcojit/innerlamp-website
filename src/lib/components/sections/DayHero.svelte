<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { canChiYear, solarToLunar, isAuspiciousDay } from '$lib/utils/lunar';

	interface Props {
		date: Date;
	}

	let { date }: Props = $props();

	const locale = getLocale();
	const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
	const p2 = (n: number) => String(n).padStart(2, '0');

	const view = $derived.by(() => {
		const lunar = solarToLunar(date);
		const good = isAuspiciousDay(date, lunar.month);
		const kind = good ? m.day_kind_good() : m.day_kind_bad();
		const type =
			lunar.day === 15
				? { dot: '#D9963C', label: m.day_type_full({ kind }) }
				: lunar.day === 1
					? { dot: '#D9963C', label: m.day_type_new({ kind }) }
					: {
							dot: good ? '#5E8A6C' : '#C64545',
							label: good ? m.lunar_good_day() : m.lunar_bad_day()
						};
		const month = m.day_month({ month: p2(lunar.month) });
		return {
			day: p2(lunar.day),
			month: lunar.leap ? m.day_month_leap({ month: p2(lunar.month) }) : month,
			year: m.day_year({ name: canChiYear(lunar.year) }),
			solar: `${weekdayLong.format(date)}, ${p2(date.getDate())}/${p2(date.getMonth() + 1)}/${date.getFullYear()}`,
			type
		};
	});
</script>

<section
	data-keep-dark
	aria-labelledby="day-title"
	class="relative h-[340px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#efe6d5_0%,#e2d4bb_55%,#f7f2e8_100%)]"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(247,242,232,.94)_0%,rgba(247,242,232,.82)_38%,rgba(247,242,232,.1)_75%)]"
	></div>
	<div class="pointer-events-none absolute right-6 bottom-9 left-[clamp(24px,4vw,48px)] text-ink">
		<h1 id="day-title" class="sr-only">{m.day_meta_title()} · {view.solar}</h1>
		<div class="flex items-center gap-2">
			<span
				class="size-3.5 rounded-full border border-gold-deep/45 shadow-[inset_-4px_0_0_0_#8a5a18]"
				aria-hidden="true"
			></span>
			<p class="text-[10.5px] font-semibold tracking-[.18em] text-[#74500f] uppercase">
				{m.day_eyebrow()}
			</p>
		</div>
		<div class="mt-3 flex items-end gap-[18px]">
			<p class="font-serif text-[clamp(72px,18vw,112px)]/[0.9] font-medium">{view.day}</p>
			<div class="pb-2">
				<p class="font-serif text-[22px]/[1.3] font-medium text-[#3a332b]">{view.month}</p>
				<p class="mt-[3px] text-sm text-ink/60">{view.year}</p>
			</div>
		</div>
		<div class="mt-4 flex flex-wrap items-center gap-3">
			<p class="text-sm font-medium">{view.solar}</p>
			<p
				class="flex items-center gap-[7px] rounded-full border border-ink/8 bg-paper px-3 py-1.5 text-xs font-medium"
			>
				<span class="size-[7px] rounded-full" style:background={view.type.dot} aria-hidden="true"
				></span>
				{view.type.label}
			</p>
		</div>
	</div>
</section>
