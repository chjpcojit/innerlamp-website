<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { templeRankLabel, templeSectLabel } from '$lib/utils/temple-labels';
	import { templeFollow } from '$lib/state/temple-follow.svelte';
	import TempleEvents from './TempleEvents.svelte';
	import TempleSanghaCard from '$lib/features/sangha/components/TempleSanghaCard.svelte';
	import type { TempleAmenities, TempleDetail } from '$lib/types/temple';
	import type { TempleEventEntry } from '$lib/types/temple-event';

	interface Props {
		temple: TempleDetail;
		events: TempleEventEntry[];
		/** The user's practice temple; null when unset, unknown or a guest. */
		sanghaTemple: { id: string; name: string } | null;
		isGuest: boolean;
	}

	let { temple, events, sanghaTemple, isGuest }: Props = $props();

	const AMENITY_LABELS: Record<keyof TempleAmenities, () => string> = {
		parking_car: () => m.temple_amenity_parking_car(),
		parking_motorcycle: () => m.temple_amenity_parking_motorcycle(),
		vegetarian_meals: () => m.temple_amenity_vegetarian_meals(),
		summer_retreat: () => m.temple_amenity_summer_retreat()
	};

	const following = $derived(templeFollow.has(temple.id));
	const rank = $derived(templeRankLabel(temple.heritage_rank));
	const sect = $derived(templeSectLabel(temple.sect));
	const amenities = $derived(
		(Object.keys(AMENITY_LABELS) as (keyof TempleAmenities)[])
			.filter((key) => temple.amenities[key])
			.map((key) => AMENITY_LABELS[key]())
	);
	const directionsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${temple.location.lat},${temple.location.lng}`
	);

	onMount(() => templeFollow.init());

	const label = 'text-[10.5px] font-semibold tracking-[.16em] text-ink/45';
	const card = 'rounded-[22px] border border-ink/8 bg-paper p-[22px]';
	const pill =
		'flex h-11 flex-1 items-center justify-center rounded-full text-[13.5px] font-medium transition-colors';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external Google Maps link -->
<article class="flex flex-col gap-8">
	<header
		data-keep-dark
		class="relative flex h-[clamp(300px,42vw,440px)] flex-col justify-end overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_70%_20%,#4a3b25,#1c1813_70%)]"
	>
		{#if temple.image_url}
			<img src={temple.image_url} alt="" class="absolute inset-0 size-full object-cover" />
		{/if}
		<div
			class="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(20,17,13,.8))]"
		></div>
		<div class="relative px-[clamp(24px,4vw,44px)] pb-8 text-cream">
			{#if rank || sect}
				<div class="flex flex-wrap gap-1.5">
					{#if rank}
						<span
							class="rounded-full border border-amber-light/55 px-2.5 py-1 text-xs font-medium text-amber-light"
						>
							{rank}
						</span>
					{/if}
					{#if sect}
						<span class="rounded-full border border-cream/40 px-2.5 py-1 text-xs font-medium">
							{sect}
						</span>
					{/if}
				</div>
			{/if}
			<h1 class="mt-3.5 font-serif text-[clamp(48px,12vw,64px)]/[1.1] font-medium">
				{temple.name}
			</h1>
			<p class="mt-2 text-sm text-cream/85">{temple.location.province}</p>
		</div>
	</header>

	<TempleSanghaCard {temple} current={sanghaTemple} {isGuest} />

	<div class="flex flex-wrap items-start gap-9">
		<div class="flex min-w-0 flex-[2_1_480px] flex-col gap-7">
			{#if temple.introduction}
				<section aria-labelledby="tp-intro">
					<h2 id="tp-intro" class={label}>{m.temple_d_intro()}</h2>
					<p
						class="mt-3 max-w-[680px] text-[17px]/[1.8] text-pretty whitespace-pre-line text-ink/80"
					>
						{temple.introduction}
					</p>
				</section>
			{/if}

			{#if temple.architecture_heritage}
				<section aria-labelledby="tp-architecture">
					<h2 id="tp-architecture" class={label}>{m.temple_d_architecture()}</h2>
					<p
						class="mt-3 max-w-[680px] text-[17px]/[1.8] text-pretty whitespace-pre-line text-ink/80"
					>
						{temple.architecture_heritage}
					</p>
				</section>
			{/if}

			{#if temple.visiting_notes.length}
				<section aria-labelledby="tp-visiting">
					<h2 id="tp-visiting" class={label}>{m.temple_d_visiting()}</h2>
					<ol class="mt-3 flex flex-col gap-2">
						{#each temple.visiting_notes as note, i (i)}
							<li class="flex items-start gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3">
								<span class="w-6 flex-none font-serif text-lg text-gold-deep">{i + 1}</span>
								<span class="flex-1 text-sm/[1.55]">{note}</span>
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			<TempleEvents entries={events} />
		</div>

		<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
			<div class="{card} flex flex-col gap-4">
				<dl class="flex flex-col gap-4">
					<div>
						<dt class="text-xs text-ink/45">{m.temple_d_address()}</dt>
						<dd class="mt-[3px] text-sm/normal">{temple.location.full_address}</dd>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_founded()}</dt>
							<dd class="mt-[3px] font-serif text-[22px]">{temple.established_year}</dd>
						</div>
						{#if temple.operating_hours}
							<div>
								<dt class="text-xs text-ink/45">{m.temple_d_hours()}</dt>
								<dd class="mt-[3px] font-serif text-[22px]">{temple.operating_hours}</dd>
							</div>
						{/if}
					</div>
					{#if temple.founder}
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_founder()}</dt>
							<dd class="mt-[3px] text-sm/normal">{temple.founder}</dd>
						</div>
					{/if}
					{#if temple.current_abbot}
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_abbot()}</dt>
							<dd class="mt-[3px] text-sm/normal">{temple.current_abbot}</dd>
						</div>
					{/if}
					{#if temple.aliases.length}
						<div>
							<dt class="text-xs text-ink/45">{m.temple_d_aliases()}</dt>
							<dd class="mt-[3px] text-sm/normal">{temple.aliases.join(' · ')}</dd>
						</div>
					{/if}
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
				</div>
			</div>

			{#if amenities.length}
				<section class={card} aria-labelledby="tp-amenities">
					<h2 id="tp-amenities" class={label}>{m.temple_d_amenities()}</h2>
					<ul class="mt-3 flex flex-wrap gap-2">
						{#each amenities as a (a)}
							<li class="rounded-full border border-ink/12 px-3 py-1.5 text-[13px]">{a}</li>
						{/each}
					</ul>
				</section>
			{/if}
		</aside>
	</div>
</article>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
