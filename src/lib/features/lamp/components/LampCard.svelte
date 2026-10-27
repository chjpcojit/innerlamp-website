<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import { lampType } from '$lib/content/lamps';
	import type { RemainingLabel } from '$lib/features/lamp/remaining';
	import type { GardenLamp } from '$lib/types/lamp';

	interface Props {
		lamp: GardenLamp;
		/** Computed when the list renders; never `out` (those cards are not rendered). */
		remaining: Exclude<RemainingLabel, { kind: 'out' }>;
	}

	let { lamp, remaining }: Props = $props();

	const type = $derived(lampType(lamp.lamp_type));
</script>

<li
	class="flex h-52 min-w-0 flex-col items-center rounded-[18px] border px-3.5 pt-4 pb-3.5 text-center {lamp.is_mine
		? 'border-amber-light/50 bg-amber-light/8'
		: 'border-[#f2ebdd]/8 bg-[#f2ebdd]/4'}"
>
	<LampVessel {type} mode="lit" size="mini" />
	<span
		class="mt-2.5 rounded-full bg-amber-light/12 px-[9px] py-[3px] text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap text-[#e8b061]"
	>
		{type.name()}
	</span>
	<p class="mt-2 w-full truncate text-[13px] font-medium">
		{lamp.is_mine ? m.lamp_wall_you() : lamp.lighter_name || m.lamp_wall_anonymous()}
	</p>
	<p class="mt-[3px] w-full truncate text-xs text-[#f2ebdd]/55">
		{lamp.recipient ? m.lamp_to_person({ name: lamp.recipient }) : m.lamp_to_all()}
	</p>
	<p class="mt-auto text-xs text-[#e8b061]">
		{remaining.kind === 'days'
			? m.lamp_remaining_days({ count: remaining.days })
			: m.lamp_remaining_under_day()}
	</p>
</li>
