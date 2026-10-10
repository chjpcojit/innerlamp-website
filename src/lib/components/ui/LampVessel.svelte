<script lang="ts">
	import type { LampType } from '$lib/content/lamps';
	import LampFlame, { type FlameMode } from './LampFlame.svelte';

	interface Props {
		type: LampType;
		mode: FlameMode;
		/** `hero` is the big lamp on the offering card, `mini` the tile on the lamp wall. */
		size?: 'hero' | 'mini';
	}

	let { type, mode, size = 'hero' }: Props = $props();

	const hero = $derived(size === 'hero');
	const cupWidth = $derived(Math.round((hero ? 150 : 54) * type.width));
	const cupHeight = $derived(hero ? 62 : type.kind === 'lotus' ? 28 : 22);
</script>

<!-- Authored colours must survive the dark-mode inversion, hence the nested keep-dark. -->
<div
	data-keep-dark
	aria-hidden="true"
	class="flex flex-none flex-col items-center justify-end {hero ? 'h-[260px]' : 'h-[82px] w-full'}"
>
	<div class="flex items-end justify-center {hero ? 'h-[76px] w-20' : 'h-11 w-[30px]'}">
		<LampFlame size={hero ? 70 : 34} {mode} />
	</div>
	<div
		style:width="{cupWidth}px"
		style:height="{cupHeight}px"
		style:border-radius={type.radius}
		style:background={type.cup}
		class="transition-[width] duration-300 {hero
			? 'shadow-[inset_0_6px_0_rgba(255,240,200,.25),0_18px_40px_rgba(0,0,0,.45)]'
			: 'shadow-[inset_0_3px_0_rgba(255,240,200,.25),0_8px_18px_rgba(0,0,0,.35)]'}"
	></div>
	{#if hero}
		<div class="h-[22px] w-[46px] bg-[linear-gradient(180deg,#5a4128,#3a2a1a)]"></div>
		<div class="h-3 w-[110px] rounded-full bg-[linear-gradient(180deg,#5a4128,#2e2115)]"></div>
	{:else if type.kind === 'oil'}
		<div class="h-2.5 w-4 bg-[linear-gradient(180deg,#5a4128,#3a2a1a)]"></div>
	{:else if type.kind === 'float'}
		<div
			class="mt-[3px] h-[7px] w-[72px] rounded-[50%] bg-[radial-gradient(ellipse,rgba(120,170,230,.4),transparent_70%)]"
		></div>
	{/if}
</div>
