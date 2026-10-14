<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { BUDDHAS } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { DeitySummary } from '$lib/types/deity';

	interface Props {
		title?: string;
		/** Featured deities from the backend; when null/omitted the static catalogue is shown. */
		items?: DeitySummary[] | null;
	}

	let { title = m.buddhas_title(), items = null }: Props = $props();

	const kindLabel = (type: string) =>
		type === 'BUDDHA'
			? m.buddha_kind_buddha()
			: type === 'BODHISATTVA'
				? m.buddha_kind_bodhisattva()
				: m.buddha_kind_deva();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<section id="buddhas" class="scroll-mt-24" aria-labelledby="buddhas-title">
	<SectionHeading id="buddhas-title" {title} href="/library/buddhas" icon="buddha" />
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
		{#if items?.length}
			{#each items as d (d.id)}
				<li class="relative">
					<div
						class="relative aspect-3/4 overflow-hidden rounded-[18px] border border-ink/8 bg-linear-to-b from-sand to-sand-deep"
					>
						{#if d.thumbnail_url}
							<img
								src={d.thumbnail_url}
								alt={d.name_vi}
								loading="lazy"
								class="absolute inset-0 size-full object-cover"
							/>
						{/if}
						<span
							class="absolute top-2 left-2 rounded-full bg-night/60 px-2 py-[3px] text-[10.5px] font-medium text-[#f7f1e4]"
						>
							{kindLabel(d.type)}
						</span>
					</div>
					<p class="mt-2.5 font-serif text-lg/[1.3] text-pretty">
						<a
							href={localizeHref(`/library/buddhas/${encodeURIComponent(d.id)}`)}
							class="after:absolute after:inset-0">{d.name_vi}</a
						>
					</p>
					{#if d.core_virtue}
						<p class="mt-[3px] line-clamp-2 text-xs text-ink/45">{d.core_virtue}</p>
					{/if}
				</li>
			{/each}
		{:else}
			{#each BUDDHAS as b (b.via)}
				<li>
					<div
						class="relative aspect-3/4 overflow-hidden rounded-[18px] border border-ink/8 bg-linear-to-b from-sand to-sand-deep"
						aria-hidden="true"
					>
						<span
							class="absolute top-2 left-2 rounded-full bg-night/60 px-2 py-[3px] text-[10.5px] font-medium text-[#f7f1e4]"
						>
							{b.kind()}
						</span>
						<span
							class="absolute inset-x-0 bottom-[18%] mx-auto block h-12 w-8 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-linear-to-b from-amber-light to-amber opacity-80 shadow-[0_0_30px_rgba(217,150,60,.7)]"
						></span>
					</div>
					<p class="mt-2.5 font-serif text-lg/[1.3] text-pretty">{b.name()}</p>
					<p class="mt-[3px] text-xs text-ink/45">{m.buddha_via({ date: b.via })}</p>
				</li>
			{/each}
		{/if}
	</ul>
</section>
