<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import MalaRing from '$lib/components/ui/MalaRing.svelte';
	import { MALA_TOTAL } from '$lib/utils/mala';

	let beads = $state(0);

	function advance() {
		beads = beads >= MALA_TOTAL ? 1 : beads + 1;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		const el = e.target as HTMLElement | null;
		if (e.code !== 'Space' || el?.closest('button, a, input, textarea, select, [contenteditable]'))
			return;
		e.preventDefault();
		advance();
	}}
/>

<section
	aria-labelledby="practice-mala-title"
	class="flex flex-col items-center justify-center rounded-[28px] border border-ink/8 bg-paper p-[30px] text-center"
>
	<h2 id="practice-mala-title" class="text-sm font-medium">{m.practice_tool_mala_title()}</h2>
	<div class="mt-5"><MalaRing count={beads} size={200} onadvance={advance} /></div>
	<p class="mt-5 font-serif text-xl">{m.practice_bead_mantra()}</p>
	<p class="mt-1.5 text-xs text-ink/45">{m.practice_mala_hint()}</p>
	<button
		type="button"
		onclick={() => (beads = 0)}
		class="mt-4 cursor-pointer rounded-full border border-ink/18 px-5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-ink/4"
	>
		{m.practice_bead_reset()}
	</button>
</section>
