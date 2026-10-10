<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { msg } from '$lib/utils/msg';
	import { dayAdvice, solarToLunar } from '$lib/utils/lunar';
	import {
		VERSE_COUNT,
		canChiOfDate,
		dayAlmanac,
		ratingColor,
		RATING_SCALE
	} from '$lib/utils/almanac';

	interface Props {
		date: Date;
	}

	let { date }: Props = $props();

	const locale = getLocale();
	const dayMonth = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });

	const view = $derived.by(() => {
		const lunar = solarToLunar(date);
		const al = dayAlmanac(date);
		const names = canChiOfDate(date);
		const verse = ((lunar.day + lunar.month) % VERSE_COUNT) + 1;
		const advice = dayAdvice(lunar.day);
		const note =
			lunar.day === 1
				? m.day_note_new()
				: lunar.day === 15
					? m.day_note_full()
					: advice === 'fast'
						? m.day_note_fast()
						: m.day_note_plain();
		return {
			al,
			rating: msg(`rating_${al.rating}`),
			color: ratingColor(al.rating),
			ratingSub: al.auspicious
				? m.day_rating_sub_good({ truc: al.truc })
				: m.day_rating_sub_bad({ truc: al.truc }),
			cells: [
				{ k: m.day_label_day(), v: names.day },
				{ k: m.day_label_month(), v: names.month },
				{ k: m.day_label_year(), v: names.year }
			],
			term: msg(`tiet_${al.termIndex}`),
			termLine: m.day_term_line({
				from: dayMonth.format(al.termFrom),
				days: al.termDaysLeft,
				next: msg(`tiet_${al.termNextIndex}`)
			}),
			verse: msg(`verse_${verse}`).split('\n'),
			source: msg(`verse_${verse}_src`),
			note
		};
	});

	const eyebrow = 'text-[10.5px] font-semibold tracking-[.14em] text-ink/45 uppercase';
</script>

<div class="flex flex-col gap-7">
	<section
		aria-label={m.day_stems_aria()}
		class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] rounded-[22px] border border-ink/8 bg-paper"
	>
		{#each view.cells as c (c.k)}
			<div class="border-r border-ink/7 px-[22px] py-[18px]">
				<p class={eyebrow}>{c.k}</p>
				<p class="mt-1.5 font-serif text-[22px] font-medium">{c.v}</p>
			</div>
		{/each}
		<div class="px-[22px] py-[18px]">
			<p class={eyebrow}>{m.day_label_term()}</p>
			<p class="mt-1.5 font-serif text-[22px] font-medium">{view.term}</p>
			<p class="mt-[3px] text-xs text-ink/52">{view.termLine}</p>
		</div>
	</section>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-stretch gap-5">
		<section class="flex flex-col justify-center rounded-[22px] border border-ink/8 bg-paper p-6">
			<div class="flex items-center gap-[18px]">
				<p
					class="flex size-[76px] flex-none items-center justify-center rounded-full text-center font-serif text-lg/[1.15] font-medium text-white"
					style:background={view.color}
					aria-hidden="true"
				>
					{view.rating}
				</p>
				<div class="min-w-0 flex-1">
					<h2 class={eyebrow}>{m.day_rating_label()}</h2>
					<p class="mt-1 font-serif text-[28px] font-medium">
						{m.day_rating_title({ rating: view.rating })}
					</p>
					<p class="mt-[3px] text-[13px] text-ink/55">{view.ratingSub}</p>
				</div>
			</div>
			<ol class="mt-5 flex gap-1" aria-label={m.day_rating_scale_aria()}>
				{#each RATING_SCALE as s (s.rating)}
					{@const on = s.score === view.al.score}
					<li
						aria-current={on ? 'true' : undefined}
						class="flex h-[30px] flex-1 items-center justify-center rounded-lg text-xs font-medium whitespace-nowrap {on
							? 'text-white'
							: 'bg-ink/8 text-ink/45'}"
						style:background={on ? view.color : undefined}
					>
						{msg(`rating_${s.rating}`)}
					</li>
				{/each}
			</ol>
		</section>

		<section
			class="relative flex flex-col justify-center overflow-hidden rounded-[22px] border border-gold/30 bg-[#fbf3e4] p-6 text-center"
		>
			<div
				class="pointer-events-none absolute -top-[90px] left-1/2 size-[260px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.22),transparent_66%)]"
			></div>
			<blockquote class="relative">
				<p class="flex flex-col gap-0.5 font-serif text-[22px]/[1.55] font-medium text-pretty">
					{#each view.verse as line (line)}
						<span>{line}</span>
					{/each}
				</p>
				<footer class="mt-2.5 font-serif text-[13px] text-ink/55 italic">{view.source}</footer>
			</blockquote>
			<p class="relative mt-2.5 text-xs font-medium text-[#74500f]">{view.note}</p>
		</section>
	</div>
</div>
