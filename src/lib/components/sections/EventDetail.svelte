<script lang="ts">
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { CalendarEventDetail, CalendarNeighbour } from '$lib/types/calendar';

	interface Props {
		detail: CalendarEventDetail;
	}

	let { detail }: Props = $props();

	const locale = getLocale();
	const weekdayFull = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });

	/** Local-midnight Date of a `YYYY-MM-DD` string (no timezone shift). */
	function parseIso(iso: string): Date {
		const [y, mo, d] = iso.split('-').map(Number);
		return new Date(y, mo - 1, d);
	}

	/** Backend texts separate paragraphs / steps with line breaks. */
	const lines = (text: string) =>
		text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean);

	const about = $derived(lines(detail.event.long_description || detail.event.short_description));
	const dos = $derived(lines(detail.event.guidance));
	const left = $derived(
		detail.days_left === 0
			? m.ev_left_today()
			: detail.days_left > 0
				? m.ev_d_in_days({ count: detail.days_left })
				: m.ev_d_days_ago({ count: -detail.days_left })
	);

	const lunarLabel = (d: { day: number; month: number }) =>
		m.ev_d_lunar({ day: d.day, month: d.month });
	const whenLabel = (n: CalendarNeighbour) =>
		`${m.ev_lunar_date({ day: n.lunar_date.day, month: n.lunar_date.month })} · ${weekdayFull.format(parseIso(n.solar_date))}`;
	const href = (n: CalendarNeighbour) =>
		localizeHref(`/events/${encodeURIComponent(n.code)}?date=${n.solar_date}`);

	const pill =
		'rounded-full border border-cream/45 px-[18px] py-[11px] text-[13px] font-medium whitespace-nowrap text-cream transition-colors hover:bg-cream/10';
	const card = 'rounded-[22px] border border-ink/8 bg-paper';
	const eyebrow = 'text-[10.5px] font-semibold tracking-[.14em] text-ink/45 uppercase';
</script>

<article class="flex flex-col gap-7">
	<header
		data-keep-dark
		class="relative flex min-h-[clamp(340px,40vw,440px)] flex-col justify-end overflow-hidden rounded-[28px] bg-linear-to-br from-[#2a2620] to-night"
	>
		{#if detail.event.image_url}
			<img src={detail.event.image_url} alt="" class="absolute inset-0 size-full object-cover" />
		{/if}
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_20%,rgba(217,150,60,.24),transparent)]"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-t from-[rgba(22,19,16,.9)] via-[rgba(22,19,16,.45)] to-[rgba(22,19,16,.05)]"
			aria-hidden="true"
		></div>
		<div
			class="relative flex flex-wrap items-end justify-between gap-6 px-[clamp(22px,4vw,44px)] py-8 text-[#f5eee0]"
		>
			<div class="min-w-0 flex-[1_1_380px]">
				<div class="flex flex-wrap items-center gap-2.5">
					{#if detail.group_names.length > 0}
						<p class="text-[10.5px] font-semibold tracking-[.18em] text-[#f3c673] uppercase">
							{detail.group_names.join(' · ')}
						</p>
					{/if}
					<p class="rounded-full bg-[#f5eee0]/14 px-2.5 py-1 text-xs font-medium">{left}</p>
					{#if detail.event.is_public_holiday}
						<p class="rounded-full bg-[#f3c673]/20 px-2.5 py-1 text-xs font-medium text-[#f3c673]">
							{m.ev_d_holiday()}
						</p>
					{/if}
				</div>
				<h1 class="mt-3 font-serif text-[clamp(40px,7vw,60px)]/[1.08] font-medium text-pretty">
					{detail.event.name}
				</h1>
				<p class="mt-2.5 text-sm text-[#f5eee0]/75">
					{lunarLabel(detail.lunar_date)} · {weekdayFull.format(parseIso(detail.solar_date))}
				</p>
			</div>
			<div class="flex flex-wrap gap-2.5">
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
				<a href={localizeHref('/practice/lamp')} class={pill}>{m.ev_d_lamp()}</a>
				<a href={localizeHref(`/lunar/day?date=${detail.solar_date}`)} class={pill}>
					{m.ev_d_open_day()}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		</div>
	</header>

	{#if about.length > 0 || dos.length > 0}
		<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-5">
			{#if about.length > 0}
				<section class="{card} px-7 py-[26px]" aria-labelledby="evd-about">
					<h2 id="evd-about" class={eyebrow}>{m.ev_d_about()}</h2>
					<div class="mt-3.5 flex flex-col gap-3.5">
						{#each about as paragraph, i (i)}
							<p class="text-[15px]/[1.75] text-pretty text-ink/80">{paragraph}</p>
						{/each}
					</div>
				</section>
			{/if}
			{#if dos.length > 0}
				<section class="{card} px-7 pt-[26px] pb-3" aria-labelledby="evd-dos">
					<h2 id="evd-dos" class={eyebrow}>{m.ev_d_dos()}</h2>
					<ol class="mt-1.5 flex flex-col">
						{#each dos as step, i (i)}
							<li class="flex gap-4 border-b border-ink/7 py-3.5 last:border-b-0">
								<span class="min-w-7 font-serif text-[22px]/none font-medium text-gold">
									{String(i + 1).padStart(2, '0')}
								</span>
								<span class="min-w-0 flex-1 text-[14.5px]/[1.55] text-pretty">{step}</span>
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		</div>
	{/if}

	{#if detail.prev || detail.next}
		<nav
			class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3 border-t border-ink/10 pt-[22px]"
			aria-label={m.ev_meta_title()}
		>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
			{#if detail.prev}
				<a
					href={href(detail.prev)}
					rel="prev"
					class="block rounded-[18px] px-[18px] py-3.5 hover:bg-sand"
				>
					<span class="block text-xs font-medium text-ink/50">‹ {m.ev_d_prev()}</span>
					<span class="mt-1 block font-serif text-xl/tight font-medium">{detail.prev.name}</span>
					<span class="mt-[3px] block text-xs text-ink/50">{whenLabel(detail.prev)}</span>
				</a>
			{/if}
			{#if detail.next}
				<a
					href={href(detail.next)}
					rel="next"
					class="block rounded-[18px] px-[18px] py-3.5 text-right hover:bg-sand md:col-start-2"
				>
					<span class="block text-xs font-medium text-ink/50">{m.ev_d_next()} ›</span>
					<span class="mt-1 block font-serif text-xl/tight font-medium">{detail.next.name}</span>
					<span class="mt-[3px] block text-xs text-ink/50">{whenLabel(detail.next)}</span>
				</a>
			{/if}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</nav>
	{/if}
</article>
