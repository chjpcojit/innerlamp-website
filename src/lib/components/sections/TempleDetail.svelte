<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { TEMPLE_LIST, type TempleItem } from '$lib/content/temples';
	import { templeFollow } from '$lib/state/temple-follow.svelte';

	interface Props {
		temple: TempleItem;
	}

	let { temple }: Props = $props();

	const following = $derived(templeFollow.has(temple.id));
	const nearby = $derived(
		TEMPLE_LIST.filter((t) => t.region === temple.region && t.id !== temple.id).slice(0, 3)
	);
	const directionsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${temple.name()}, ${temple.address()}`)}`
	);
	const photos = [
		() => m.temple_d_photo_hall(),
		() => m.temple_d_photo_statue(),
		() => m.temple_d_photo_grounds()
	];
	const schedule = [
		{ t: () => m.temple_d_sched_1_t(), l: () => m.temple_d_sched_1_l() },
		{ t: () => m.temple_d_sched_2_t(), l: () => m.temple_d_sched_2_l() },
		{ t: () => m.temple_d_sched_3_t(), l: () => m.temple_d_sched_3_l() }
	];

	onMount(() => templeFollow.init());

	const label = 'text-[10.5px] font-semibold tracking-[.16em] text-ink/45';
	const card = 'rounded-[22px] border border-ink/8 bg-paper p-[22px]';
	const pill =
		'flex h-11 flex-1 items-center justify-center rounded-full text-[13.5px] font-medium transition-colors';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<article class="flex flex-col gap-8">
	<header
		data-keep-dark
		class="relative flex h-[clamp(300px,42vw,440px)] flex-col justify-end overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_70%_20%,#4a3b25,#1c1813_70%)]"
	>
		<div
			class="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(20,17,13,.8))]"
		></div>
		<div class="relative px-[clamp(24px,4vw,44px)] pb-8 text-cream">
			<div class="flex flex-wrap gap-1.5">
				<span
					class="rounded-full border border-amber-light/55 px-2.5 py-1 text-xs font-medium text-amber-light"
				>
					{temple.heritage ? m.temple_d_heritage({ rank: temple.rank() }) : temple.rank()}
				</span>
				<span class="rounded-full border border-cream/40 px-2.5 py-1 text-xs font-medium">
					{temple.sect()}
				</span>
			</div>
			<h1 class="mt-3.5 font-serif text-[clamp(48px,12vw,64px)]/[1.1] font-medium">
				{temple.name()}
			</h1>
			<p class="mt-2 text-sm text-cream/85">{temple.place()}</p>
		</div>
	</header>

	<div class="flex flex-wrap items-start gap-9">
		<div class="flex min-w-0 flex-[2_1_480px] flex-col gap-7">
			<section aria-labelledby="tp-intro">
				<h2 id="tp-intro" class={label}>{m.temple_d_intro()}</h2>
				<p class="mt-3 max-w-[680px] text-[17px]/[1.8] text-pretty text-ink/80">
					{temple.intro()}
				</p>
			</section>

			<section aria-labelledby="tp-highlights">
				<h2 id="tp-highlights" class={label}>{m.temple_d_highlights()}</h2>
				<ol class="mt-3 flex flex-col gap-2">
					{#each temple.highlights as h, i (i)}
						<li class="flex items-start gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3">
							<span class="w-6 flex-none font-serif text-lg text-gold-deep">{i + 1}</span>
							<span class="flex-1 text-sm/[1.55]">{h()}</span>
						</li>
					{/each}
				</ol>
			</section>

			<section aria-labelledby="tp-photos">
				<h2 id="tp-photos" class={label}>{m.temple_d_photos()}</h2>
				<ul class="mt-3 grid grid-cols-3 gap-3">
					{#each photos as p, i (i)}
						<li
							class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] bg-[repeating-linear-gradient(135deg,#efe6d5_0_8px,#f4ede0_8px_16px)] font-mono text-[10.5px] text-ink/40"
						>
							{p()}
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
			<div class="{card} flex flex-col gap-4">
				<dl class="flex flex-col gap-4">
					<div>
						<dt class="text-xs text-ink/45">{m.temple_d_address()}</dt>
						<dd class="mt-[3px] text-sm/normal">{temple.address()}</dd>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_founded()}</dt>
							<dd class="mt-[3px] font-serif text-[22px]">{temple.year()}</dd>
						</div>
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_hours()}</dt>
							<dd class="mt-[3px] font-serif text-[22px]">{temple.hours}</dd>
						</div>
					</div>
				</dl>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						aria-pressed={following}
						onclick={() => templeFollow.toggle(temple.id)}
						class="{pill} min-w-[130px] cursor-pointer border border-ink {following
							? 'bg-paper text-ink hover:bg-white'
							: 'bg-ink text-cream hover:bg-[#3a342c]'}"
					>
						{following ? m.temple_d_following() : m.temple_d_follow()}
					</button>
					<a
						href={directionsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="{pill} min-w-[110px] border border-ink/18 hover:bg-white"
					>
						{m.temple_d_directions()}
					</a>
					{#if temple.offerSlug}
						<a
							href={localizeHref(`/offer?temple=${temple.offerSlug}`)}
							class="{pill} basis-full bg-amber text-[#1a1611] hover:bg-[#e6a94e]"
						>
							{m.temple_d_offer()}
						</a>
					{/if}
				</div>
			</div>

			<section class={card} aria-labelledby="tp-schedule">
				<h2 id="tp-schedule" class={label}>{m.temple_d_schedule()}</h2>
				<ul class="mt-2 flex flex-col">
					{#each schedule as e, i (i)}
						<li
							class="flex justify-between gap-3 border-b border-ink/7 py-3 text-[13.5px] last:border-b-0"
						>
							<span>{e.l()}</span>
							<span class="font-medium whitespace-nowrap text-gold-deep">{e.t()}</span>
						</li>
					{/each}
				</ul>
				<a
					href={localizeHref('/lunar')}
					class="mt-3 inline-block text-xs font-medium text-gold-deep hover:underline"
				>
					{m.temple_d_lunar()} ›
				</a>
			</section>
		</aside>
	</div>

	{#if nearby.length}
		<section aria-labelledby="tp-nearby">
			<h2 id="tp-nearby" class="mb-3.5 font-serif text-[28px]">{m.temple_d_nearby()}</h2>
			<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
				{#each nearby as t (t.id)}
					<li
						class="relative overflow-hidden rounded-[22px] border border-ink/8 bg-paper transition-colors focus-within:bg-white hover:bg-white"
					>
						<div
							class="flex h-[120px] items-center justify-center bg-[repeating-linear-gradient(135deg,#efe6d5_0_8px,#f4ede0_8px_16px)] font-mono text-[10.5px] text-ink/40"
							aria-hidden="true"
						>
							{m.temple_photo_label()}
						</div>
						<div class="px-4 pt-3.5 pb-4">
							<h3 class="font-serif text-lg">
								<a href={localizeHref(`/temples/${t.id}`)} class="after:absolute after:inset-0">
									{t.name()}
								</a>
							</h3>
							<p class="mt-1 text-xs text-ink/50">{t.place()}</p>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
