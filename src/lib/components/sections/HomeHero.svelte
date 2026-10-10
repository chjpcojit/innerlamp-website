<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import TodayCelebration from '$lib/components/sections/TodayCelebration.svelte';
	import type { SessionUser } from '$lib/types/user';
	import { LUNAR_MONTHS, PLACEHOLDER_STATS } from '$lib/content/home';
	import { canChiYear, dayAdvice, isAuspiciousDay, solarToLunar } from '$lib/utils/lunar';

	let { user }: { user: SessionUser | null } = $props();

	const today = new Date();
	const locale = getLocale();
	const cardLink = 'text-xs font-medium whitespace-nowrap text-[#e8b061] hover:underline';
	const isoDate = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	const fullFormat = new Intl.DateTimeFormat(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});

	const lunarLabel = (d: Date) => {
		const l = solarToLunar(d);
		return m.home_lunar_date({ day: l.day, month: LUNAR_MONTHS[l.month - 1]() });
	};

	const hour = today.getHours();
	const greeting = (name: string) =>
		hour < 11
			? m.home_greeting_morning({ name })
			: hour < 17
				? m.home_greeting_afternoon({ name })
				: m.home_greeting_evening({ name });

	const ADVICE = {
		strict: () => m.advice_strict(),
		fast: () => m.advice_fast(),
		regular: () => m.advice_regular()
	};

	const TASKS = [
		{
			title: () => m.home_task_1_title(),
			sub: () => m.home_task_1_sub(),
			cta: () => m.home_task_1_cta(),
			href: '/practice',
			minutes: 20
		},
		{
			title: () => m.home_task_2_title(),
			sub: () => m.home_task_2_sub(),
			cta: () => m.home_task_2_cta(),
			href: '/practice',
			minutes: 28
		},
		{
			title: () => m.home_task_3_title(),
			sub: () => m.home_task_3_sub(),
			cta: () => m.home_task_3_cta(),
			href: '/library',
			minutes: 24
		}
	];
	const GOAL_MINUTES = TASKS.reduce((sum, t) => sum + t.minutes, 0);
	/** Time of the next morning practice shown once everything is done. */
	const NEXT_PRACTICE_TIME = '05:30';

	const QUICK_LINKS = [
		{ kind: 'calendar', href: '/lunar', label: () => m.home_quick_calendar() },
		{ kind: 'book', href: '/library', label: () => m.home_quick_sutras() },
		{ kind: 'mo', href: '/practice', label: () => m.home_quick_bell() },
		{ kind: 'med', href: '/practice', label: () => m.home_quick_meditate() }
	] as const;

	const WEEKDAY_SHORT = [
		() => m.weekday_short_0(),
		() => m.weekday_short_1(),
		() => m.weekday_short_2(),
		() => m.weekday_short_3(),
		() => m.weekday_short_4(),
		() => m.weekday_short_5(),
		() => m.weekday_short_6()
	];
	const VERSES = [
		{ text: () => m.verse_1(), src: () => m.verse_1_src() },
		{ text: () => m.verse_2(), src: () => m.verse_2_src() },
		{ text: () => m.verse_3(), src: () => m.verse_3_src() },
		{ text: () => m.verse_4(), src: () => m.verse_4_src() }
	];

	let done = $state([true, false, false]);
	let showList = $state(false);
	let celebrating = $state(false);
	const doneCount = $derived(done.filter(Boolean).length);
	const allDone = $derived(doneCount === TASKS.length);
	const doneMinutes = $derived(TASKS.reduce((sum, t, i) => sum + (done[i] ? t.minutes : 0), 0));
	const streakDays = $derived(PLACEHOLDER_STATS.streakDays + (allDone ? 1 : 0));

	function toggleTask(i: number) {
		done[i] = !done[i];
		if (done[i] && done.every(Boolean)) celebrating = true;
	}

	const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' });
	const mondayOffset = -((today.getDay() + 6) % 7);

	let weekOffset = $state(0);
	let selected = $state(Math.max(0, -mondayOffset));

	const week = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const d = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() + mondayOffset + weekOffset * 7 + i
			);
			const lunar = solarToLunar(d);
			return {
				label: WEEKDAY_SHORT[d.getDay()](),
				full: fullFormat.format(d),
				day: d.getDate(),
				lunar,
				advice: dayAdvice(lunar.day),
				good: isAuspiciousDay(d, lunar.month),
				festival: lunar.day === 1 || lunar.day === 15,
				isToday: d.toDateString() === today.toDateString(),
				date: d
			};
		})
	);
	const sel = $derived(week[selected]);
	const verse = $derived(VERSES[(sel.lunar.day + sel.lunar.month) % VERSES.length]);
	const weekRange = $derived(
		`${weekOffset === 0 ? `${m.home_week_this()} · ` : ''}${dayMonth.format(week[0].date)} – ${dayMonth.format(week[6].date)}`
	);

	const lunarCell = (d: (typeof week)[number]) =>
		d.lunar.day === 15
			? m.home_lunar_full_moon()
			: d.lunar.day === 1
				? m.home_lunar_new_moon()
				: String(d.lunar.day).padStart(2, '0');

	function shiftWeek(delta: number) {
		weekOffset += delta;
		selected = weekOffset === 0 ? Math.max(0, -mondayOffset) : 0;
	}
</script>

<section class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-stretch gap-7">
	<div class="flex flex-col justify-between gap-7 py-2">
		<div>
			<p class="text-[13px] text-ink/55">{fullFormat.format(today)} — {lunarLabel(today)}</p>
			<h1 class="mt-3.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.15] text-pretty">
				{#if !user}
					{m.home_guest_title()}
				{:else if user.name}
					{greeting(user.name)}
				{:else}
					{m.home_greeting_anon()}
				{/if}
			</h1>
			<p class="mt-4 font-serif text-lg/relaxed text-ink/60 italic">{m.home_tagline()}</p>
			{#if !user}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
				<ul class="mt-[26px] grid grid-cols-4 gap-2.5">
					{#each QUICK_LINKS as q (q.kind)}
						<li>
							<a
								href={localizeHref(q.href)}
								class="flex flex-col items-center gap-2.5 rounded-[18px] border border-ink/8 bg-paper px-1.5 pt-4 pb-3.5 text-center transition-colors hover:border-gold/45"
							>
								<Icon kind={q.kind} tone="#8A5A18" size={44} />
								<span class="text-[13px] font-medium">{q.label()}</span>
							</a>
						</li>
					{/each}
				</ul>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
		</div>
		{#if user}
			<div class="flex flex-col gap-7">
				<div class="flex flex-col gap-2">
					<h2
						class="text-[10.5px] font-semibold tracking-[.14em] {allDone
							? 'text-sage'
							: 'text-ink/45'}"
					>
						{m.home_tasks_label()} · {allDone
							? m.home_tasks_complete({ done: doneCount, total: TASKS.length })
							: `${doneCount}/${TASKS.length}`}
					</h2>
					{#if allDone}
						<div
							class="il-motion flex items-center gap-4 rounded-[18px] border border-sage/35 bg-sage/12 px-[18px] py-4"
							style="animation:il-rise1 .6s cubic-bezier(.2,.8,.2,1) both"
						>
							<span
								class="flex size-11 flex-none items-center justify-center rounded-full bg-[#6e8f7a]"
								aria-hidden="true"
							>
								<span
									class="h-4 w-[9px] -translate-y-0.5 rotate-45 border-r-[2.5px] border-b-[2.5px] border-paper"
								></span>
							</span>
							<div class="min-w-0 flex-1">
								<p class="font-serif text-[22px]/tight">{m.home_all_done_title()}</p>
								<p class="mt-[3px] text-xs/normal text-ink/60">
									{TASKS.map((t) => t.title()).join(' · ')}
								</p>
								<p class="mt-1.5 text-xs font-medium text-sage">
									{m.home_all_done_next({ time: NEXT_PRACTICE_TIME })}
								</p>
							</div>
							<button
								type="button"
								onclick={() => (showList = !showList)}
								aria-expanded={showList}
								class="cursor-pointer self-start text-xs font-medium whitespace-nowrap text-gold-deep hover:text-gold"
							>
								{showList ? m.home_all_done_collapse() : m.home_all_done_review()}
							</button>
						</div>
					{/if}
					{#if !allDone || showList}
						<ul class="flex flex-col gap-2">
							{#each TASKS as task, i (i)}
								<li
									class="flex items-center gap-3.5 rounded-2xl border border-ink/8 bg-paper pr-4 transition-colors hover:border-gold/45"
								>
									<button
										type="button"
										onclick={() => toggleTask(i)}
										aria-pressed={done[i]}
										class="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 py-3 pl-4 text-left"
									>
										<span
											class="flex size-5 flex-none items-center justify-center rounded-full border-[1.5px] {done[
												i
											]
												? 'border-[#6e8f7a] bg-[#6e8f7a]'
												: 'border-ink/25'}"
											aria-hidden="true"
										>
											<span
												class="h-2.5 w-1.5 -translate-y-px rotate-45 border-r-2 border-b-2 border-paper {done[
													i
												]
													? 'opacity-100'
													: 'opacity-0'}"
											></span>
										</span>
										<span class="min-w-0 flex-1">
											<span
												class="block text-sm font-medium {done[i]
													? 'text-ink/50 line-through'
													: ''}">{task.title()}</span
											>
											<span class="mt-0.5 block text-xs text-ink/50">{task.sub()}</span>
										</span>
									</button>
									<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
									<a
										href={localizeHref(task.href)}
										class="text-xs font-medium whitespace-nowrap text-gold-deep hover:text-gold"
									>
										{task.cta()}
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
				<a href={localizeHref('/profile')} class="mb-5 flex gap-7">
					<dl>
						<dd class="font-serif text-[28px]">
							{doneMinutes}<span class="text-base text-ink/45">
								/ {GOAL_MINUTES}
								{m.home_stat_minutes_unit()}</span
							>
						</dd>
						<dt class="mt-1 text-xs text-ink/50">{m.home_stat_today()}</dt>
					</dl>
					<div class="w-px bg-ink/12" aria-hidden="true"></div>
					<dl>
						<dd class="font-serif text-[28px]">
							{streakDays}<span class="text-base text-ink/45"> {m.home_stat_days_unit()}</span>
						</dd>
						<dt class="mt-1 text-xs text-ink/50">{m.home_stat_streak()}</dt>
					</dl>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		{:else}
			<div class="flex flex-col gap-3.5">
				<div class="flex flex-wrap gap-2.5">
					<Button href="/signup">{m.home_cta_signup_free()}</Button>
					<Button href="/login" variant="outline">{m.home_cta_login()}</Button>
				</div>
				<p class="text-xs/relaxed text-ink/52">{m.home_guest_note()}</p>
			</div>
		{/if}
	</div>

	<div
		data-keep-dark
		class="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#2a2620] to-night px-[clamp(18px,5vw,30px)] pt-[clamp(20px,5vw,28px)] pb-6 text-[#f5eee0]"
	>
		<div
			class="pointer-events-none absolute -top-[120px] left-[30%] h-[300px] w-[360px] rounded-full bg-[radial-gradient(ellipse,rgba(217,150,60,.26),transparent_66%)]"
			aria-hidden="true"
		></div>
		<div class="relative mb-4 flex justify-end gap-4">
			<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
			<a href={localizeHref(`/lunar/day?date=${isoDate(sel.date)}&from=home`)} class={cardLink}>
				{m.home_lunar_detail()} ›
			</a>
			<a href={localizeHref('/lunar')} class={cardLink}>{m.home_lunar_calendar()} ›</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
		<div class="relative mb-3 flex items-center justify-between gap-3">
			<p class="text-[10.5px] font-semibold tracking-[.14em] text-[#f2ebdd]/60">{weekRange}</p>
			<div class="flex gap-1.5">
				{#each [-1, 1] as delta (delta)}
					<button
						type="button"
						onclick={() => shiftWeek(delta)}
						aria-label={delta < 0 ? m.home_week_prev() : m.home_week_next()}
						class="flex size-[30px] cursor-pointer items-center justify-center rounded-full border border-[#f2ebdd]/18 text-[15px] text-[#f2ebdd] transition-colors hover:bg-[#f2ebdd]/8"
					>
						{delta < 0 ? '‹' : '›'}
					</button>
				{/each}
			</div>
		</div>
		<ol class="relative grid grid-cols-7 gap-[clamp(4px,1vw,8px)]" aria-label={m.home_week_aria()}>
			{#each week as d, i (d.date.getTime())}
				<li class="min-w-0">
					<button
						type="button"
						onclick={() => (selected = i)}
						aria-pressed={selected === i}
						class="w-full cursor-pointer rounded-[14px] border px-0 pt-[9px] pb-2 text-center transition-colors {selected ===
						i
							? 'border-amber-light bg-amber-light text-[#1a1611]'
							: d.festival
								? 'border-amber-light/75 bg-[#f2ebdd]/5 text-[#f2ebdd]'
								: d.isToday
									? 'border-amber/70 bg-[#f2ebdd]/5 text-[#f2ebdd]'
									: 'border-[#f2ebdd]/8 bg-[#f2ebdd]/5 text-[#f2ebdd]'}"
					>
						<span class="block text-[10.5px] font-medium opacity-60">{d.label}</span>
						<span class="mt-[3px] block font-serif text-[22px]"
							>{String(d.day).padStart(2, '0')}</span
						>
						<span
							class="mt-px block text-[10.5px] whitespace-nowrap {d.festival
								? 'font-semibold'
								: ''} {selected === i || d.festival ? '' : 'opacity-55'} {d.festival &&
							selected !== i
								? 'text-amber-light'
								: ''}">{lunarCell(d)}</span
						>
						<span
							class="mx-auto mt-1.5 block size-[5px] rounded-full {d.good
								? selected === i
									? 'bg-[#4e6c59]'
									: 'bg-[#7fa88c]'
								: selected === i
									? 'bg-[#9a5f58]'
									: 'bg-[#d98a80]'}"
							aria-hidden="true"
						></span>
					</button>
				</li>
			{/each}
		</ol>
		<ul
			class="relative mt-3 mb-6 flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-xs text-[#f2ebdd]/62"
		>
			<li class="flex items-center gap-1.5">
				<span class="size-1.5 rounded-full bg-[#7fa88c]" aria-hidden="true"></span>
				{m.home_legend_good()}
			</li>
			<li class="flex items-center gap-1.5">
				<span class="size-1.5 rounded-full bg-[#d98a80]" aria-hidden="true"></span>
				{m.home_legend_bad()}
			</li>
			<li class="flex items-center gap-1.5">
				<span class="size-2.5 rounded border border-amber-light/90" aria-hidden="true"></span>
				{m.home_legend_festival()}
			</li>
		</ul>
		<div class="relative flex items-start gap-5">
			<div class="font-serif text-[clamp(68px,16vw,88px)]/none text-amber-light">
				{String(sel.lunar.day).padStart(2, '0')}
			</div>
			<div class="pt-2.5">
				<p class="text-[15px] font-medium">
					{m.home_lunar_month({ month: LUNAR_MONTHS[sel.lunar.month - 1]() })}{sel.lunar.leap
						? ` (${m.home_lunar_leap()})`
						: ''}
				</p>
				<p class="mt-1 text-xs text-[#f2ebdd]/60">
					{canChiYear(sel.lunar.year)} · {sel.full}
				</p>
				<div class="mt-3 flex flex-wrap gap-1.5">
					<span
						class="inline-flex rounded-full bg-amber/16 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#e8b061]"
					>
						{ADVICE[sel.advice]()}
					</span>
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-[#f2ebdd]/7 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#f2ebdd]"
					>
						<span
							class="size-1.5 rounded-full {sel.good ? 'bg-[#7fa88c]' : 'bg-[#d98a80]'}"
							aria-hidden="true"
						></span>
						{sel.good ? m.home_kind_good() : m.home_kind_bad()}
					</span>
				</div>
			</div>
		</div>
		<blockquote class="relative mt-[22px] max-w-[440px] border-l-2 border-[#e8b061]/45 pl-4">
			<p class="font-serif text-lg/[1.6] whitespace-pre-line italic">{verse.text()}</p>
			<footer class="mt-2.5 text-xs font-medium tracking-[.04em] text-[#e8b061]">
				{verse.src()}
			</footer>
		</blockquote>
	</div>
</section>

{#if user}
	<TodayCelebration
		bind:open={celebrating}
		name={user.name}
		streak={streakDays}
		minutes={doneMinutes}
		total={TASKS.length}
	/>
{/if}
