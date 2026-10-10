<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { PHOTOS } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	/** Tile spans that give the desktop mosaic; they collapse to a plain 2-column grid on mobile. */
	const SPANS = ['col-span-2 row-span-2', '', 'md:row-span-2', ''];
</script>

<section id="gallery" class="scroll-mt-24" aria-labelledby="gallery-title">
	<SectionHeading id="gallery-title" title={m.gallery_title()} href="/gallery" icon="photo" />
	<ul class="grid auto-rows-[170px] grid-cols-2 gap-3.5 md:grid-cols-4">
		{#each PHOTOS as p, i (p.name())}
			<li class="relative min-h-0 overflow-hidden rounded-[20px] bg-sand {SPANS[i]}">
				<div
					class="absolute inset-0 bottom-[52px] flex items-center justify-center bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] font-mono text-[10.5px] text-ink/40"
					aria-hidden="true"
				>
					{m.photo_label()}
				</div>
				<div
					data-keep-dark
					class="absolute inset-x-0 bottom-0 flex h-[52px] flex-col justify-center bg-ink px-3.5 text-[#f5eee0]"
				>
					<p class="truncate font-serif text-lg/tight">{p.name()}</p>
					<p class="mt-0.5 truncate text-xs text-[#f5eee0]/70">{p.place()}</p>
				</div>
			</li>
		{/each}
	</ul>
</section>
