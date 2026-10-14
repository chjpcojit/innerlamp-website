<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { DeityDetail } from '$lib/types/deity';

	interface Props {
		deity: DeityDetail;
	}

	let { deity }: Props = $props();

	const kind = $derived(
		deity.type === 'BUDDHA'
			? m.buddha_kind_buddha()
			: deity.type === 'BODHISATTVA'
				? m.buddha_kind_bodhisattva()
				: m.buddha_kind_deva()
	);

	const pad = (n: number) => String(n).padStart(2, '0');
	const { iconography: icon, mantras } = $derived(deity);
	const hasIconography = $derived(
		!!(
			icon.posture ||
			icon.mount_or_throne ||
			icon.sacred_artifacts.length ||
			icon.symbolic_meaning
		)
	);
	const hasMantras = $derived(
		!!(
			mantras.short_mantra_sanskrit ||
			mantras.short_mantra_sino_vietnamese ||
			mantras.long_dharani_name ||
			mantras.dharani_phonetic_snippet
		)
	);

	const card = 'rounded-[22px] border border-ink/8 bg-paper p-6';
	const heading = 'text-[10.5px] font-semibold tracking-[.16em] text-ink/45 uppercase';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<a
		href={localizeHref('/library/buddhas')}
		class="w-fit text-[13px] font-medium text-ink/55 hover:text-ink"
	>
		← {m.buddha_d_back()}
	</a>

	<div class="flex flex-wrap items-start gap-8">
		<aside class="flex max-w-[360px] flex-[1_1_260px] flex-col gap-[18px]">
			<div
				class="relative aspect-3/4 overflow-hidden rounded-[22px] border border-ink/8 bg-linear-to-b from-sand to-sand-deep"
			>
				{#if deity.image_url}
					<img
						src={deity.image_url}
						alt={deity.name_vi}
						class="absolute inset-0 size-full object-cover"
					/>
				{/if}
				<span
					class="absolute top-3 left-3 rounded-full bg-night/60 px-2.5 py-1 text-[10.5px] font-medium text-[#f7f1e4]"
				>
					{kind}
				</span>
			</div>
		</aside>

		<div class="flex min-w-0 flex-[2_1_380px] flex-col gap-5">
			<header>
				<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]/tight text-pretty">{deity.name_vi}</h1>
				{#if deity.title_honorific}
					<p class="mt-2 font-serif text-lg text-ink/60 italic">{deity.title_honorific}</p>
				{/if}
				{#if deity.name_sanskrit || deity.name_chinese}
					<p class="mt-1.5 text-sm text-ink/45">
						{[deity.name_sanskrit, deity.name_chinese].filter(Boolean).join(' · ')}
					</p>
				{/if}
			</header>

			{#if deity.core_virtue || deity.pure_land || deity.canonical_source}
				<dl class="{card} grid gap-4 text-[13.5px]/[1.6]">
					{#if deity.core_virtue}
						<div>
							<dt class={heading}>{m.buddha_d_virtue()}</dt>
							<dd class="mt-1 text-pretty text-ink/80">{deity.core_virtue}</dd>
						</div>
					{/if}
					{#if deity.pure_land}
						<div>
							<dt class={heading}>{m.buddha_d_pure_land()}</dt>
							<dd class="mt-1 text-pretty text-ink/80">{deity.pure_land}</dd>
						</div>
					{/if}
					{#if deity.canonical_source}
						<div>
							<dt class={heading}>{m.buddha_d_source()}</dt>
							<dd class="mt-1 text-pretty text-ink/80">{deity.canonical_source}</dd>
						</div>
					{/if}
				</dl>
			{/if}

			{#if deity.biography_summary}
				<section class={card} aria-labelledby="buddha-bio">
					<h2 id="buddha-bio" class="font-serif text-[22px]">{m.buddha_d_biography()}</h2>
					<p class="mt-3 text-[14px]/[1.75] text-pretty text-ink/75">{deity.biography_summary}</p>
				</section>
			{/if}

			{#if deity.great_vows.length}
				<section class={card} aria-labelledby="buddha-vows">
					<h2 id="buddha-vows" class="font-serif text-[22px]">{m.buddha_d_vows()}</h2>
					<ol class="mt-3 flex list-decimal flex-col gap-2.5 pl-5 text-[14px]/[1.7] text-ink/75">
						{#each deity.great_vows as vow, i (i)}
							<li class="text-pretty">{vow}</li>
						{/each}
					</ol>
				</section>
			{/if}

			{#if deity.lunar_memorial_days.length}
				<section class={card} aria-labelledby="buddha-days">
					<h2 id="buddha-days" class="font-serif text-[22px]">{m.buddha_d_memorial()}</h2>
					<ul class="mt-3 flex flex-col gap-2 text-[14px]">
						{#each deity.lunar_memorial_days as d (`${d.lunar_month}-${d.lunar_day}-${d.event_name}`)}
							<li class="flex flex-wrap items-baseline justify-between gap-x-4">
								<span class="text-ink/80">{d.event_name}</span>
								<span class="text-xs font-medium text-gold-deep">
									{m.buddha_via({ date: `${pad(d.lunar_day)}/${pad(d.lunar_month)}` })}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if hasIconography}
				<section class={card} aria-labelledby="buddha-icon">
					<h2 id="buddha-icon" class="font-serif text-[22px]">{m.buddha_d_iconography()}</h2>
					<dl class="mt-3 grid gap-4 text-[13.5px]/[1.6]">
						{#if icon.posture}
							<div>
								<dt class={heading}>{m.buddha_d_posture()}</dt>
								<dd class="mt-1 text-pretty text-ink/80">{icon.posture}</dd>
							</div>
						{/if}
						{#if icon.mount_or_throne}
							<div>
								<dt class={heading}>{m.buddha_d_throne()}</dt>
								<dd class="mt-1 text-pretty text-ink/80">{icon.mount_or_throne}</dd>
							</div>
						{/if}
						{#if icon.sacred_artifacts.length}
							<div>
								<dt class={heading}>{m.buddha_d_artifacts()}</dt>
								<dd class="mt-1 text-ink/80">
									<ul class="list-disc pl-5">
										{#each icon.sacred_artifacts as a, i (i)}<li>{a}</li>{/each}
									</ul>
								</dd>
							</div>
						{/if}
						{#if icon.symbolic_meaning}
							<div>
								<dt class={heading}>{m.buddha_d_meaning()}</dt>
								<dd class="mt-1 text-pretty text-ink/80">{icon.symbolic_meaning}</dd>
							</div>
						{/if}
					</dl>
				</section>
			{/if}

			{#if hasMantras}
				<section class={card} aria-labelledby="buddha-mantra">
					<h2 id="buddha-mantra" class="font-serif text-[22px]">{m.buddha_d_mantras()}</h2>
					<dl class="mt-3 grid gap-4 text-[13.5px]/[1.6]">
						{#if mantras.short_mantra_sino_vietnamese}
							<div>
								<dt class={heading}>{m.buddha_d_mantra_vi()}</dt>
								<dd class="mt-1 font-serif text-lg text-pretty">
									{mantras.short_mantra_sino_vietnamese}
								</dd>
							</div>
						{/if}
						{#if mantras.short_mantra_sanskrit}
							<div>
								<dt class={heading}>{m.buddha_d_mantra_sa()}</dt>
								<dd class="mt-1 font-serif text-lg text-pretty italic">
									{mantras.short_mantra_sanskrit}
								</dd>
							</div>
						{/if}
						{#if mantras.long_dharani_name}
							<div>
								<dt class={heading}>{m.buddha_d_dharani()}</dt>
								<dd class="mt-1 text-pretty text-ink/80">{mantras.long_dharani_name}</dd>
							</div>
						{/if}
						{#if mantras.dharani_phonetic_snippet}
							<div>
								<dt class={heading}>{m.buddha_d_dharani_text()}</dt>
								<dd class="mt-1 text-pretty text-ink/70 italic">
									{mantras.dharani_phonetic_snippet}
								</dd>
							</div>
						{/if}
					</dl>
				</section>
			{/if}
		</div>
	</div>
</div>
