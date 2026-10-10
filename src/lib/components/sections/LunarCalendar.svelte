<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { EVENTS, LUNAR_MONTHS } from '$lib/content/home';
	import {
		branchHours,
		canChiYear,
		chiName,
		dayAdvice,
		goodHourBranches,
		isAuspiciousDay,
		solarToLunar
	} from '$lib/utils/lunar';

	const locale = getLocale();
	const DAY_MS = 86_400_000;
	const today = new Date();
	const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long' });
	const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
	const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
	const dayMonthFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' });
	const cellLabelFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });

	// 2024-01-01 is a Monday: header labels run Monday → Sunday.
	const weekdays = Array.from({ length: 7 }, (_, i) =>
		weekdayShort.format(new Date(2024, 0, 1 + i))
	);

	const ADVICE = {
		strict: () => m.advice_strict(),
		fast: () => m.advice_fast(),
		regular: () => m.advice_regular()
	};

	const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
	const p2 = (n: number) => String(n).padStart(2, '0');
	const isoDate = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

	// `?date=YYYY-MM-DD` (from the home "Chi tiết ngày" link) opens that day.
	const requested = (() => {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(page.url.searchParams.get('date') ?? '');
		if (!match) return null;
		const d = new Date(+match[1], +match[2] - 1, +match[3]);
		return d.getMonth() === +match[2] - 1 ? d : null;
	})();
	const initial = requested ?? startOfToday;

	let viewMonth = $state(new Date(initial.getFullYear(), initial.getMonth(), 1));
	let selected = $state(initial);

	function shift(delta: number) {
		const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1);
		viewMonth = next;
		selected =
			next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth()
				? startOfToday
				: next;
	}

	const cells = $derived.by(() => {
		const y = viewMonth.getFullYear();
		const mo = viewMonth.getMonth();
		const offset = (viewMonth.getDay() + 6) % 7;
		const daysInMonth = new Date(y, mo + 1, 0).getDate();
		const total = Math.ceil((offset + daysInMonth) / 7) * 7;
		return Array.from({ length: total }, (_, i) => {
			const date = new Date(y, mo, 1 - offset + i);
			const lunar = solarToLunar(date);
			return {
				date,
				inMonth: date.getMonth() === mo,
				lunar,
				fast: dayAdvice(lunar.day) !== 'regular',
				label:
					lunar.day === 1
						? `1/${lunar.month}`
						: lunar.day === 15
							? m.home_lunar_full_moon()
							: String(lunar.day).padStart(2, '0')
			};
		});
	});

	const monthLunar = $derived.by(() => {
		const first = solarToLunar(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1));
		const last = solarToLunar(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0));
		const mid = solarToLunar(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 15));
		const months =
			first.month === last.month
				? m.lunar_month_single({ month: LUNAR_MONTHS[first.month - 1]() })
				: m.lunar_month_range({
						from: LUNAR_MONTHS[first.month - 1](),
						to: LUNAR_MONTHS[last.month - 1]()
					});
		return m.lunar_subtitle({ year: canChiYear(mid.year), months });
	});

	const sel = $derived.by(() => {
		const lunar = solarToLunar(selected);
		return {
			lunar,
			advice: ADVICE[dayAdvice(lunar.day)](),
			good: isAuspiciousDay(selected, lunar.month),
			monthLabel:
				m.home_lunar_month({ month: LUNAR_MONTHS[lunar.month - 1]() }) +
				(lunar.leap ? ` (${m.home_lunar_leap()})` : ''),
			full: m.lunar_selected_full({
				weekday: weekdayLong.format(selected),
				day: selected.getDate(),
				month: locale === 'vi' ? selected.getMonth() + 1 : monthFormat.format(selected),
				year: canChiYear(lunar.year)
			}),
			hours: goodHourBranches(selected).map((b) => {
				const { from, to } = branchHours(b);
				return { chi: chiName(b), range: m.lunar_hour_range({ from, to }) };
			})
		};
	});

	const upcoming = EVENTS.map((e) => ({
		item: e,
		daysLeft: Math.round((e.date.getTime() - startOfToday.getTime()) / DAY_MS)
	})).filter((e) => e.daysLeft >= 0);
</script>

<div class="flex flex-col gap-7">
	<div class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight font-medium">
				{m.lunar_heading({
					month: locale === 'vi' ? viewMonth.getMonth() + 1 : monthFormat.format(viewMonth),
					year: viewMonth.getFullYear()
				})}
			</h1>
			<p class="mt-2 text-sm text-ink/55">{monthLunar}</p>
		</div>
		<div class="flex gap-2">
			{#each [{ delta: -1, label: m.lunar_prev(), glyph: '‹' }, { delta: 1, label: m.lunar_next(), glyph: '›' }] as nav (nav.delta)}
				<button
					type="button"
					aria-label={nav.label}
					onclick={() => shift(nav.delta)}
					class="flex size-10 cursor-pointer items-center justify-center rounded-full border border-ink/14 text-ink/60 transition-colors hover:bg-sand/60"
				>
					<span aria-hidden="true">{nav.glyph}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="flex flex-wrap items-start gap-7">
		<section
			aria-label={m.lunar_grid_label()}
			class="min-w-0 flex-[2_1_560px] rounded-3xl border border-ink/8 bg-paper p-[clamp(10px,3vw,22px)]"
		>
			<div
				class="mb-2.5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-ink/42"
				aria-hidden="true"
			>
				{#each weekdays as w (w)}
					<div>{w}</div>
				{/each}
			</div>
			<div class="grid grid-cols-7 gap-[clamp(3px,1vw,6px)]">
				{#each cells as c (c.date.getTime())}
					{@const on = sameDay(c.date, selected)}
					<button
						type="button"
						aria-pressed={on}
						aria-label={cellLabelFormat.format(c.date)}
						onclick={() => (selected = c.date)}
						class="flex h-[clamp(52px,11vw,76px)] cursor-pointer flex-col justify-between rounded-[clamp(9px,2vw,14px)] border p-[clamp(5px,1.2vw,10px)] text-start transition-colors {on
							? 'border-transparent bg-ink text-cream'
							: c.fast
								? 'border-transparent bg-gold/14 text-ink'
								: 'border-transparent bg-cream-soft text-ink'} {sameDay(c.date, startOfToday) && !on
							? '!border-gold'
							: ''} {c.inMonth || on ? '' : 'opacity-40'}"
					>
						<span class="font-serif text-[clamp(17px,4vw,22px)]">
							{String(c.date.getDate()).padStart(2, '0')}
						</span>
						<span
							class="self-end text-[clamp(9.5px,2.4vw,11px)] font-medium whitespace-nowrap opacity-65"
						>
							{c.label}
						</span>
					</button>
				{/each}
			</div>
			<div class="mt-4 flex flex-wrap gap-[18px] text-xs text-ink/50">
				<p class="flex items-center gap-[7px]">
					<span class="size-3 rounded bg-gold/14" aria-hidden="true"></span>
					{m.lunar_legend_fast()}
				</p>
				<p class="flex items-center gap-[7px] whitespace-nowrap">
					<span class="size-3 rounded border border-gold" aria-hidden="true"></span>
					{m.lunar_legend_today()}
				</p>
			</div>
		</section>

		<div class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
			<section
				data-keep-dark
				aria-live="polite"
				class="relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#2a2620,#161310)] p-6 text-[#f5eee0]"
			>
				<div
					class="pointer-events-none absolute -top-[60px] -right-[60px] size-[220px] rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.3),transparent_66%)]"
				></div>
				<div class="relative flex items-start gap-4">
					<p class="font-serif text-[clamp(50px,12.6vw,67px)]/none text-amber-light">
						{String(sel.lunar.day).padStart(2, '0')}
					</p>
					<div class="pt-1.5">
						<p class="text-sm font-medium">{sel.monthLabel}</p>
						<p class="mt-[3px] text-xs text-[#f2ebdd]/60">{sel.full}</p>
					</div>
				</div>
				<div class="relative mt-3.5 flex flex-wrap items-center gap-2">
					<span
						class="rounded-full bg-amber/16 px-3 py-1.5 text-[11.5px] font-medium text-[#e8b061]"
					>
						{sel.advice}
					</span>
					<span class="flex items-center gap-1.5 text-[11.5px] text-[#f2ebdd]/70">
						<span
							class="size-2 rounded-full {sel.good ? 'bg-[#7fa88c]' : 'bg-[#d98a80]'}"
							aria-hidden="true"
						></span>
						{sel.good ? m.lunar_good_day() : m.lunar_bad_day()}
					</span>
				</div>
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
				<a
					href={localizeHref(`/lunar/day?date=${isoDate(selected)}`)}
					class="relative mt-4 inline-block text-[13px] font-medium text-amber-light hover:underline"
				>
					{m.home_lunar_detail()} ›
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</section>

			<section class="rounded-[22px] border border-ink/8 bg-paper p-5">
				<h2 class="mb-3 text-[13px] font-medium">{m.lunar_good_hours()}</h2>
				<ul class="grid grid-cols-3 gap-2">
					{#each sel.hours as h (h.chi)}
						<li class="rounded-xl bg-cream-soft p-2.5 text-center">
							<p class="text-[13px] font-medium">{h.chi}</p>
							<p class="mt-0.5 text-[11px] text-ink/50">{h.range}</p>
						</li>
					{/each}
				</ul>
			</section>

			<section
				class="rounded-[22px] border border-ink/8 bg-paper px-5 py-2"
				aria-label={m.lunar_upcoming()}
			>
				<ul>
					{#each upcoming as { item: e, daysLeft } (e.name())}
						<li class="flex gap-3 border-b border-ink/6 py-3 last:border-b-0">
							<span
								class="w-1 rounded-sm {e.highlight ? 'bg-gold' : 'bg-sand-deep'}"
								aria-hidden="true"
							></span>
							<div class="min-w-0 flex-1">
								<p class="text-[13px] font-medium {e.highlight ? 'text-gold-deep' : ''}">
									{e.name()}
								</p>
								<p class="mt-0.5 text-[11.5px] text-ink/50">
									{dayMonthFormat.format(e.date)} · {daysLeft === 0
										? m.events_today()
										: m.events_days_left({ count: daysLeft })}
								</p>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	</div>

	<p class="text-xs text-ink/45">{m.lunar_disclaimer()}</p>
</div>
