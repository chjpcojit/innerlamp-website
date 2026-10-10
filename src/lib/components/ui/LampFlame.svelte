<script module lang="ts">
	export type FlameMode = 'off' | 'igniting' | 'lit';
</script>

<script lang="ts">
	interface Props {
		/** Flame height in px; width is half of it. */
		size: number;
		mode: FlameMode;
	}

	let { size, mode }: Props = $props();

	const FLAME =
		'radial-gradient(ellipse at 50% 78%,#FFF8E1 0%,#FFD978 32%,#F29B38 66%,rgba(214,96,30,0) 100%)';
	const GLOW =
		'radial-gradient(circle,rgba(243,198,115,.5),rgba(217,150,60,.14) 45%,transparent 70%)';
</script>

{#if mode === 'off'}
	<div
		class="mx-auto w-[3px] rounded-xs bg-[#3a3128]"
		style:height="{size * 0.18}px"
		style:margin-top="{size * 0.82}px"
	></div>
{:else}
	<div class="il-motion relative mx-auto" style:width="{size * 0.5}px" style:height="{size}px">
		<div
			class="pointer-events-none absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
			style:width="{size * (mode === 'igniting' ? 3.2 : 2.4)}px"
			style:height="{size * (mode === 'igniting' ? 3.2 : 2.4)}px"
			style:background={GLOW}
			style:animation={mode === 'igniting'
				? 'il-glowin 1.9s ease-out forwards'
				: 'il-glow 2.4s ease-in-out infinite'}
		></div>
		<div
			class="absolute inset-0 origin-bottom"
			style:animation={mode === 'igniting'
				? 'il-ignite 1.7s cubic-bezier(.2,.7,.2,1) forwards'
				: undefined}
		>
			<div
				class="absolute inset-0 origin-bottom rounded-[50%_50%_50%_50%/62%_62%_38%_38%] blur-[.3px]"
				style:background={FLAME}
				style:animation="il-flick 1.7s ease-in-out infinite"
			></div>
			<div
				class="absolute bottom-[6%] left-1/2 h-[34%] w-[34%] -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[rgba(120,170,230,.55)] blur-[1px]"
			></div>
		</div>
	</div>
{/if}
