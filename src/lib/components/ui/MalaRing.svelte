<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { MALA_TOTAL, malaRing } from '$lib/utils/mala';

	interface Props {
		count: number;
		/** Diameter of the bead ring in px; the counter and tassel scale with it. */
		size?: number;
		onadvance: () => void;
	}

	let { count, size = 120, onadvance }: Props = $props();

	let pulse = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const ring = $derived(malaRing(count, size));
	const k = $derived(size / 120);

	function tap() {
		onadvance();
		pulse = true;
		clearTimeout(timer);
		timer = setTimeout(() => (pulse = false), 120);
	}
</script>

<button
	type="button"
	onclick={tap}
	aria-label={m.practice_bead_aria({ count })}
	class="relative flex-none cursor-pointer transition-transform duration-120 select-none {pulse
		? 'scale-[.97]'
		: ''}"
	style:width="{size}px"
	style:height="{size + 26 * k}px"
>
	{#each ring.items as b, i (i)}
		<span
			class="absolute rounded-full transition-[background,box-shadow] duration-250 {b.filled
				? 'bg-[radial-gradient(circle_at_35%_30%,#e6b86a,#b8862f_55%,#7a5320)]'
				: 'bg-[radial-gradient(circle_at_35%_30%,#f4ecdd,#e2d4bb_60%,#cbb68f)]'} {b.isCurrent
				? 'shadow-[0_0_0_3px_rgba(217,150,60,.25),0_2px_4px_rgba(34,30,25,.25)]'
				: 'shadow-[0_1px_2px_rgba(34,30,25,.2)]'}"
			style:left="{b.x}px"
			style:top="{b.y}px"
			style:width="{b.size}px"
			style:height="{b.size}px"
			aria-hidden="true"
		></span>
	{/each}
	<span
		class="absolute rounded-full bg-[radial-gradient(circle_at_35%_30%,#b07a3a,#6b4410_60%,#3e270a)] shadow-[0_2px_4px_rgba(34,30,25,.3)]"
		style:left="{ring.guruX}px"
		style:top="{ring.guruY}px"
		style:width="{ring.guru}px"
		style:height="{ring.guru}px"
		aria-hidden="true"
	></span>
	<span
		class="absolute left-1/2 -translate-x-1/2 rounded-[3px] bg-linear-to-b from-gold-deep to-[#6b4410]"
		style:top="{size * 0.98}px"
		style:width="{7 * k}px"
		style:height="{12 * k}px"
		aria-hidden="true"
	></span>
	<span
		class="absolute left-1/2 -translate-x-1/2 rounded-t-[2px] rounded-b-[12px] bg-[repeating-linear-gradient(90deg,#b8862f_0_2px,#9c6e22_2px_3px)]"
		style:top="{size * 1.07}px"
		style:width="{24 * k}px"
		style:height="{17 * k}px"
		aria-hidden="true"
	></span>
	<span
		class="absolute top-0 left-0 flex flex-col items-center justify-center"
		style:width="{size}px"
		style:height="{size}px"
	>
		<span class="font-serif leading-none" style:font-size="{size * 0.26}px">{count}</span>
		<span class="mt-0.5 text-ink/45" style:font-size="{Math.max(11, size * 0.06)}px">
			/ {MALA_TOTAL}
		</span>
	</span>
</button>
