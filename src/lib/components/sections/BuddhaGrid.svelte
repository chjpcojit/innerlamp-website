<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { BUDDHAS } from '$lib/content/home';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	let { title = m.buddhas_title() }: { title?: string } = $props();
</script>

<section id="buddhas" class="scroll-mt-24" aria-labelledby="buddhas-title">
	<SectionHeading id="buddhas-title" {title} href="/library/buddhas" icon="buddha" />
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
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
	</ul>
</section>
