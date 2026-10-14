<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import TempleEventList from './TempleEventList.svelte';
	import type { TempleEventEntry } from '$lib/types/temple-event';

	interface Props {
		entries: TempleEventEntry[];
	}

	let { entries }: Props = $props();
</script>

<section
	class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
	aria-labelledby="tp-events"
>
	<h2 id="tp-events" class="text-[10.5px] font-semibold tracking-[.16em] text-ink/45">
		{m.temple_ev_title()}
	</h2>
	<TempleEventList {entries} />
</section>
