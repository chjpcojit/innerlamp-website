<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { settings } from '$lib/state/settings.svelte';
	import { SutraPlayer, formatClock } from '$lib/state/sutra-player.svelte';
	import SutraCover from '$lib/components/ui/SutraCover.svelte';
	import type { SutraDetail, SutraSummary, SutraTranslationDetail } from '$lib/types/sutra';
	import {
		sutraAltTitle,
		sutraMeta,
		sutraTitle,
		translationLabel,
		type SutraChapter
	} from '$lib/utils/sutra';

	interface Props {
		sutra: SutraDetail;
		/** Translation being read; `null` when the sutra has none. */
		translation: SutraTranslationDetail | null;
		/** Text of that translation; `null` when it could not be loaded. */
		chapters: SutraChapter[] | null;
		related: SutraSummary[];
	}

	let { sutra, translation, chapters, related }: Props = $props();

	// The page keys this component on slug + translation, so the player is never reused.
	// svelte-ignore state_referenced_locally
	const player = new SutraPlayer(sutra.duration_minutes ?? 0);

	let index = $state(0);
	let dark = $state(false);

	const locale = $derived(getLocale());
	const title = $derived(sutraTitle(sutra.titles, locale));
	const alt = $derived(sutra.original_title || sutraAltTitle(sutra.titles, locale));
	const meta = $derived(sutraMeta(sutra));
	const chapter = $derived(chapters?.[index]);
	const chapterTitle = (c: SutraChapter) => c.title ?? title;
	const prev = $derived(chapters?.[index - 1]);
	const next = $derived(chapters?.[index + 1]);
	const credit = $derived(
		translation
			? [
					translation.translator,
					translation.source_name,
					translation.license === 'UNKNOWN' ? '' : translation.license
				]
					.filter(Boolean)
					.join(' · ')
			: ''
	);

	/** Reading sizes (px) for the 0/1/2 setting; line height is double the size. */
	const SIZES = [17, 20, 24] as const;
	const size = $derived(SIZES[settings.value.font]);

	const playLabel = $derived(
		player.playing ? m.sutra_d_pause() : player.pos ? m.sutra_d_resume() : m.sutra_d_listen()
	);

	onMount(() => {
		settings.init();
		return () => player.destroy();
	});

	const label = 'text-[10.5px] font-semibold tracking-[.16em]';
	const stepper =
		'flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-(--r-bd) text-xs font-medium transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-35';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<div class="flex flex-wrap items-start gap-8">
		<aside class="flex max-w-[320px] flex-[1_1_260px] flex-col gap-[18px]">
			<div class="max-w-[200px]">
				<SutraCover {sutra} />
			</div>
			<div>
				<h1 class="font-serif text-[28px]/[1.2]">{title}</h1>
				{#if alt}
					<p class="mt-1.5 font-serif text-sm text-ink/55 italic">{alt}</p>
				{/if}
			</div>
			{#if sutra.summary}
				<p class="text-[13px]/[1.65] text-pretty text-ink/68">{sutra.summary}</p>
			{/if}
			{#if meta}
				<p class="text-xs font-medium text-ink/45">{meta}</p>
			{/if}
			{#if sutra.translations.length > 1}
				<nav aria-label={m.sutra_d_translations()} class="flex flex-col gap-2">
					<p class="{label} text-ink/45 uppercase">{m.sutra_d_translations()}</p>
					<ul class="flex flex-wrap gap-2">
						{#each sutra.translations as t (t.key)}
							<li>
								<a
									href="?translation={encodeURIComponent(t.key)}"
									aria-current={t.key === translation?.key ? 'true' : undefined}
									class="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {t.key ===
									translation?.key
										? 'border-ink bg-ink text-cream'
										: 'border-ink/12 bg-paper text-ink/70 hover:bg-white'}"
								>
									{translationLabel(t, locale)}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
			{#if chapters && chapters.length > 1}
				<nav
					aria-label={m.sutra_d_toc_label()}
					class="rounded-[22px] border border-ink/8 bg-paper p-2"
				>
					<p class="{label} px-3 pt-2.5 pb-1.5 text-ink/45">{m.sutra_d_toc()}</p>
					<ol>
						{#each chapters as c, i (i)}
							<li>
								<button
									type="button"
									aria-current={i === index ? 'true' : undefined}
									onclick={() => (index = i)}
									class="flex w-full cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-left transition-colors {i ===
									index
										? 'bg-gold/12 text-gold-deep'
										: 'hover:bg-ink/4'}"
								>
									<span class="w-4 font-serif text-sm opacity-70">{i + 1}</span>
									<span class="text-[13px] font-medium">{chapterTitle(c)}</span>
								</button>
							</li>
						{/each}
					</ol>
				</nav>
			{/if}
		</aside>

		<div class="flex min-w-0 flex-[3_1_480px] flex-col gap-3.5">
			{#if sutra.duration_minutes}
				<div
					role="group"
					aria-label={m.sutra_d_player()}
					class="flex flex-wrap items-center gap-3.5 rounded-[18px] border border-ink/8 bg-paper px-4 py-3"
				>
					<button
						type="button"
						aria-label={playLabel}
						onclick={() => player.toggle()}
						class="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full bg-ink transition-opacity hover:opacity-85"
					>
						{#if player.playing}
							<span class="flex gap-1" aria-hidden="true">
								<span class="h-[13px] w-1 rounded-sm bg-cream"></span>
								<span class="h-[13px] w-1 rounded-sm bg-cream"></span>
							</span>
						{:else}
							<span
								class="ml-[3px] size-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-cream"
								aria-hidden="true"
							></span>
						{/if}
					</button>
					<div class="min-w-40 flex-1">
						<div class="flex justify-between text-xs font-medium">
							<span>{playLabel}</span>
							<span class="font-normal text-ink/50">
								{formatClock(player.pos)} / {formatClock(player.duration)}
							</span>
						</div>
						<div
							role="progressbar"
							aria-label={m.sutra_d_progress()}
							aria-valuemin={0}
							aria-valuemax={player.duration}
							aria-valuenow={Math.floor(player.pos)}
							class="mt-2 h-1 overflow-hidden rounded-full bg-ink/10"
						>
							<div class="h-full bg-gold" style:width="{player.percent}%"></div>
						</div>
					</div>
				</div>
			{/if}

			{#if !chapters}
				<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
					{m.sutra_d_text_error()}
				</p>
			{:else if !chapter}
				<p class="rounded-[18px] border border-ink/8 bg-paper px-5 py-6 text-sm text-ink/60">
					{m.sutra_d_no_text()}
				</p>
			{:else}
				<section
					data-keep-dark={dark ? 'fixed' : undefined}
					aria-labelledby={chapter.title ? 'sutra-chapter' : undefined}
					aria-label={chapter.title ? undefined : title}
					style:--r-bg={dark ? '#1a1611' : '#fffdf8'}
					style:--r-fg={dark ? '#ede3cf' : '#221e19'}
					style:--r-sub={dark ? 'rgba(237,227,207,.5)' : 'rgba(34,30,25,.45)'}
					style:--r-bd={dark ? 'rgba(237,227,207,.12)' : 'rgba(34,30,25,.08)'}
					class="rounded-[28px] border border-(--r-bd) bg-(--r-bg) p-[clamp(28px,4vw,48px)] text-(--r-fg) transition-colors duration-300"
				>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<p class="{label} text-(--r-sub)">
							{chapters.length > 1
								? m.sutra_d_part_of({ n: index + 1, total: chapters.length })
								: ''}
						</p>
						<div class="flex items-center gap-2">
							<button
								type="button"
								aria-label={m.sutra_d_font_down()}
								disabled={settings.value.font === 0}
								onclick={() => settings.set('font', (settings.value.font - 1) as 0 | 1)}
								class={stepper}
							>
								A−
							</button>
							<button
								type="button"
								aria-label={m.sutra_d_font_up()}
								disabled={settings.value.font === 2}
								onclick={() => settings.set('font', (settings.value.font + 1) as 1 | 2)}
								class="{stepper} text-[15px]"
							>
								A+
							</button>
							<div
								role="group"
								aria-label={m.sutra_d_mode_label()}
								class="flex rounded-full border border-(--r-bd) p-[3px]"
							>
								{#each [{ v: false, t: m.sutra_d_mode_light() }, { v: true, t: m.sutra_d_mode_dark() }] as o (o.v)}
									<button
										type="button"
										aria-pressed={dark === o.v}
										onclick={() => (dark = o.v)}
										class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors {dark ===
										o.v
											? 'bg-(--r-fg) text-(--r-bg)'
											: ''}"
									>
										{o.t}
									</button>
								{/each}
							</div>
						</div>
					</div>

					{#if chapter.title}
						<h2
							id="sutra-chapter"
							class="mt-8 text-center font-serif text-[clamp(32px,6.4vw,40px)] font-medium"
						>
							{chapter.title}
						</h2>
					{/if}
					<div class="mx-auto mt-[18px] mb-7 h-px w-10 bg-gold"></div>
					{#key index}
						<!-- Fixed-height reader: long chapters scroll inside the card, not the page. -->
						<div
							role="region"
							tabindex="0"
							aria-labelledby={chapter.title ? 'sutra-chapter' : undefined}
							aria-label={chapter.title ? undefined : title}
							class="max-h-[60vh] overflow-y-auto overscroll-contain px-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
						>
							<p
								class="mx-auto max-w-[620px] text-center font-serif font-medium text-pretty whitespace-pre-line"
								style:font-size="{size}px"
								style:line-height="{size * 2}px"
							>
								{chapter.text}
							</p>
						</div>
					{/key}

					<div
						class="mt-10 flex min-h-5 justify-between gap-3 border-t border-(--r-bd) pt-5 text-[13px] font-medium"
					>
						<div>
							{#if prev}
								<button
									type="button"
									aria-label={m.sutra_d_prev({ title: chapterTitle(prev) })}
									onclick={() => (index -= 1)}
									class="cursor-pointer hover:opacity-70"
								>
									‹ {chapterTitle(prev)}
								</button>
							{/if}
						</div>
						<div>
							{#if next}
								<button
									type="button"
									aria-label={m.sutra_d_next({ title: chapterTitle(next) })}
									onclick={() => (index += 1)}
									class="cursor-pointer hover:opacity-70"
								>
									{chapterTitle(next)} ›
								</button>
							{/if}
						</div>
					</div>
				</section>
				{#if credit}
					<p class="px-1 text-xs text-ink/45">
						{m.sutra_d_source()}:
						{#if translation?.source_url}
							<a
								href={translation.source_url}
								rel="noopener noreferrer external"
								target="_blank"
								class="underline underline-offset-2 hover:text-ink/70">{credit}</a
							>
						{:else}
							{credit}
						{/if}
					</p>
				{/if}
			{/if}
		</div>
	</div>

	{#if related.length}
		<section aria-labelledby="sutra-related">
			<h2 id="sutra-related" class="mb-4 font-serif text-[28px]">{m.sutra_d_related()}</h2>
			<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-5">
				{#each related as s (s.id)}
					<li>
						<a
							href={localizeHref(`/library/sutras/${encodeURIComponent(s.id)}`)}
							class="block rounded-[18px] transition-transform hover:-translate-y-0.5"
						>
							<SutraCover sutra={s} />
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
