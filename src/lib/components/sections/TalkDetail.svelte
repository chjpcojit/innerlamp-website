<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { formatClock } from '$lib/state/sutra-player.svelte';
	import TalkRow from '$lib/components/ui/TalkRow.svelte';
	import type { DharmaTalkDetail, DharmaTalkSummary } from '$lib/types/dharma-talk';
	import { talkMeta } from '$lib/utils/dharma-talk';

	interface Props {
		talk: DharmaTalkDetail;
		related: DharmaTalkSummary[];
	}

	let { talk, related }: Props = $props();

	const RATES = [1, 1.25, 1.5, 0.75] as const;
	const SKIP_SECONDS = 15;

	let audio = $state<HTMLAudioElement>();
	let paused = $state(true);
	let currentTime = $state(0);
	let mediaDuration = $state(0);
	let playbackRate = $state<number>(RATES[0]);
	/** YouTube start offset (s), set by a chapter click; `null` until then (no autoplay). */
	let videoStart = $state<number | null>(null);

	const hasAudio = $derived(talk.media_type === 'audio' && !!talk.audio_url);
	const hasVideo = $derived(talk.media_type === 'youtube' && !!talk.youtube_id);
	const meta = $derived(talkMeta(talk));
	/** Real length once the file is loaded, the catalogue estimate before that. */
	const duration = $derived(
		Number.isFinite(mediaDuration) && mediaDuration > 0
			? mediaDuration
			: (talk.duration_minutes ?? 0) * 60
	);
	const percent = $derived(duration ? (currentTime / duration) * 100 : 0);
	const videoSrc = $derived(
		talk.youtube_id
			? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(talk.youtube_id)}${
					videoStart === null ? '' : `?start=${Math.floor(videoStart)}&autoplay=1`
				}`
			: ''
	);
	/** Chapter currently playing (audio only): the last one that has started. */
	const activeChapter = $derived(
		hasAudio ? talk.chapters.findLastIndex((c) => c.start_seconds <= currentTime) : -1
	);

	function seek(seconds: number) {
		if (!audio) return;
		audio.currentTime = Math.min(Math.max(seconds, 0), duration || seconds);
	}

	function nextRate() {
		const i = RATES.indexOf(playbackRate as (typeof RATES)[number]);
		playbackRate = RATES[(i + 1) % RATES.length];
	}

	function jump(seconds: number) {
		if (hasAudio) {
			seek(seconds);
			void audio?.play();
		} else if (hasVideo) {
			videoStart = seconds;
		}
	}

	const label = 'text-[10.5px] font-semibold tracking-[.16em] uppercase';
	const ghost =
		'flex h-10 cursor-pointer items-center rounded-full border border-cream/18 px-3.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-cream/8';
	const card = 'rounded-[22px] border border-ink/8 bg-paper';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-8">
	<section
		data-keep-dark="1"
		class="relative flex flex-wrap items-center gap-8 overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#2a2620,#161310)] p-[clamp(20px,3vw,32px)] text-[#f5eee0]"
	>
		<div
			class="pointer-events-none absolute -top-30 -right-20 h-90 w-105 rounded-full bg-[radial-gradient(ellipse,rgba(217,150,60,.24),transparent_66%)]"
			aria-hidden="true"
		></div>

		{#if hasVideo}
			<div
				class="relative aspect-video flex-[1_1_420px] overflow-hidden rounded-[20px] bg-[#2e2922]"
			>
				<iframe
					src={videoSrc}
					title={m.talk_d_video({ title: talk.title })}
					class="absolute inset-0 size-full"
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					loading="lazy"
					referrerpolicy="strict-origin-when-cross-origin"
				></iframe>
			</div>
		{:else}
			<div
				class="relative flex aspect-square flex-[0_1_260px] items-center justify-center rounded-[20px] bg-[#2e2922] font-serif text-6xl text-[#e8b061]/70"
				aria-hidden="true"
			>
				{talk.speaker_initials}
			</div>
		{/if}

		<div class="relative min-w-0 flex-[1_1_360px]">
			<p class="{label} text-[#e8b061]">
				{talk.category ? `${m.talk_d_kicker()} · ${talk.category}` : m.talk_d_kicker()}
			</p>
			<h1 class="mt-3 font-serif text-[clamp(32px,6.4vw,40px)]/[1.2] text-pretty">{talk.title}</h1>
			{#if meta}
				<p class="mt-2.5 text-[13px] text-cream/62">{meta}</p>
			{/if}

			{#if hasAudio}
				<audio
					bind:this={audio}
					bind:paused
					bind:currentTime
					bind:duration={mediaDuration}
					bind:playbackRate
					src={talk.audio_url}
					preload="metadata"
				></audio>
				<div role="group" aria-label={m.talk_d_player()} class="mt-7">
					<div class="relative flex h-[18px] items-center">
						<div class="relative h-1 flex-1 rounded-sm bg-cream/16">
							<div
								class="absolute inset-y-0 left-0 rounded-sm bg-[#d9963c]"
								style:width="{percent}%"
							></div>
							<div
								class="absolute top-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full bg-[#f3c673]"
								style:left="{percent}%"
								aria-hidden="true"
							></div>
						</div>
						<input
							type="range"
							min="0"
							max={Math.max(duration, 1)}
							step="1"
							value={currentTime}
							oninput={(e) => seek(e.currentTarget.valueAsNumber)}
							aria-label={m.talk_d_seek()}
							aria-valuetext={`${formatClock(currentTime)} / ${formatClock(duration)}`}
							class="absolute inset-0 w-full cursor-pointer opacity-0"
						/>
					</div>
					<div class="mt-1 flex justify-between text-xs text-cream/55">
						<span>{formatClock(currentTime)}</span>
						<span>{formatClock(duration)}</span>
					</div>
					<div class="mt-4 flex items-center gap-3.5">
						<button
							type="button"
							class={ghost}
							aria-label={m.talk_d_back({ seconds: SKIP_SECONDS })}
							onclick={() => seek(currentTime - SKIP_SECONDS)}
						>
							−{SKIP_SECONDS}s
						</button>
						<button
							type="button"
							aria-label={paused ? m.talk_d_play() : m.talk_d_pause()}
							onclick={() => (paused ? audio?.play() : audio?.pause())}
							class="flex size-15 flex-none cursor-pointer items-center justify-center rounded-full bg-[#d9963c] transition-opacity hover:opacity-90"
						>
							{#if paused}
								<span
									class="ml-1 size-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-[#1a1611]"
									aria-hidden="true"
								></span>
							{:else}
								<span class="flex gap-[5px]" aria-hidden="true">
									<span class="h-5 w-[5px] rounded-sm bg-[#1a1611]"></span>
									<span class="h-5 w-[5px] rounded-sm bg-[#1a1611]"></span>
								</span>
							{/if}
						</button>
						<button
							type="button"
							class={ghost}
							aria-label={m.talk_d_forward({ seconds: SKIP_SECONDS })}
							onclick={() => seek(currentTime + SKIP_SECONDS)}
						>
							+{SKIP_SECONDS}s
						</button>
						<button
							type="button"
							class="{ghost} ml-auto min-w-13 justify-center"
							aria-label={m.talk_d_rate({ rate: `${playbackRate}×` })}
							onclick={nextRate}
						>
							{playbackRate}×
						</button>
					</div>
				</div>
			{:else if talk.duration_minutes}
				<p class="mt-5 text-xs font-medium text-cream/55">
					{m.lib_dur_minutes({ count: talk.duration_minutes })}
				</p>
			{/if}
		</div>
	</section>

	<div class="flex flex-wrap items-start gap-9">
		<div class="flex min-w-0 flex-[2_1_460px] flex-col gap-7">
			{#if talk.summary}
				<section aria-labelledby="talk-content">
					<h2 id="talk-content" class="{label} text-ink/45">{m.talk_d_content()}</h2>
					<p class="mt-3 max-w-[680px] text-[16px]/[1.8] text-pretty text-ink/80">{talk.summary}</p>
				</section>
			{/if}

			{#if talk.key_points.length}
				<section aria-labelledby="talk-points">
					<h2 id="talk-points" class="{label} text-ink/45">{m.talk_d_key_points()}</h2>
					<ul
						class="mt-3 flex max-w-[680px] list-disc flex-col gap-2 pl-5 text-[15px]/[1.7] text-ink/80 marker:text-gold-deep"
					>
						{#each talk.key_points as point, i (i)}
							<li>{point}</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if talk.quote}
				<figure class="max-w-[680px] border-l-2 border-gold/60 pl-5">
					<blockquote class="font-serif text-[22px]/[1.45] text-pretty italic">
						{talk.quote}
					</blockquote>
					{#if talk.quote_source}
						<figcaption class="mt-2 text-xs text-ink/50">{talk.quote_source}</figcaption>
					{/if}
				</figure>
			{/if}

			{#if talk.chapters.length}
				<section aria-labelledby="talk-chapters">
					<h2 id="talk-chapters" class="{label} text-ink/45">{m.talk_d_chapters()}</h2>
					<ol class="{card} mt-3 p-2">
						{#each talk.chapters as c, i (i)}
							<li>
								{#if hasAudio || hasVideo}
									<button
										type="button"
										onclick={() => jump(c.start_seconds)}
										aria-current={i === activeChapter ? 'true' : undefined}
										class="flex w-full cursor-pointer items-center gap-4 rounded-[14px] px-3.5 py-3 text-left transition-colors {i ===
										activeChapter
											? 'bg-gold/12 text-gold-deep'
											: 'hover:bg-ink/4'}"
									>
										<span class="w-11 font-mono text-[12.5px] opacity-75">
											{formatClock(c.start_seconds)}
										</span>
										<span class="text-sm font-medium">{c.title}</span>
									</button>
								{:else}
									<p class="flex items-center gap-4 px-3.5 py-3">
										<span class="w-11 font-mono text-[12.5px] opacity-75">
											{formatClock(c.start_seconds)}
										</span>
										<span class="text-sm font-medium">{c.title}</span>
									</p>
								{/if}
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			{#if talk.follow_up_meditation}
				<a
					href={localizeHref('/practice/meditate')}
					class="{card} flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white"
				>
					<span>
						<span class="{label} block text-ink/45">{m.talk_d_follow_up()}</span>
						<span class="mt-1 block font-serif text-lg">{talk.follow_up_meditation.title}</span>
					</span>
					<span class="text-xs font-medium whitespace-nowrap text-ink/50">
						{m.lib_dur_minutes({ count: talk.follow_up_meditation.minutes })}
					</span>
				</a>
			{/if}

			{#if talk.source_name || talk.license}
				<p class="text-xs text-ink/45">
					{#if talk.source_name}
						{m.talk_d_source()}
						{#if talk.source_url}
							<a
								href={talk.source_url}
								target="_blank"
								rel="noopener noreferrer external"
								class="underline underline-offset-2 hover:text-ink/70">{talk.source_name}</a
							>
						{:else}
							{talk.source_name}
						{/if}
					{/if}
					{#if talk.license}
						{talk.source_name ? ' · ' : ''}{talk.license}
					{/if}
				</p>
			{/if}
		</div>

		{#if related.length}
			<section aria-labelledby="talk-related" class="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
				<h2 id="talk-related" class="{label} text-ink/45">{m.talk_d_related()}</h2>
				<ul class="flex flex-col gap-3">
					{#each related as t (t.id)}
						<li><TalkRow talk={t} titleTag="h3" /></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
