<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { TEMPLES } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
</script>

<section id="temples" class="scroll-mt-24" aria-labelledby="temples-title">
	<SectionHeading id="temples-title" title={m.temples_title()} href="/temples" icon="temple" />
	<ul class="grid auto-rows-[180px] grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
		{#each TEMPLES as t, i (t.name())}
			<li
				class="relative overflow-hidden rounded-[22px] bg-[repeating-linear-gradient(135deg,#eae0cd_0_8px,#f1e9da_8px_16px)] {i ===
				0
					? 'row-span-2'
					: ''}"
			>
				<span class="absolute top-3.5 left-4 font-mono text-[10.5px] text-ink/40" aria-hidden="true"
					>{m.temple_photo_label()}</span
				>
				<div class="absolute inset-x-3 bottom-3 rounded-[14px] bg-paper/95 px-3.5 py-3">
					<p class="text-sm font-medium">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- locale-aware internal link -->
						<a href={localizeHref(`/temples/${t.id}`)} class="after:absolute after:inset-0">
							{t.name()}
						</a>
					</p>
					<p class="mt-0.5 text-xs text-ink/50">{t.place()}</p>
				</div>
			</li>
		{/each}
	</ul>
</section>
