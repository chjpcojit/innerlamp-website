<script lang="ts">
	interface Props {
		/** `lit` = flame burning (404); `out` = dashed, unlit flame (errors). */
		state?: 'lit' | 'out';
	}

	let { state = 'lit' }: Props = $props();
</script>

<div class="relative mx-auto size-[120px]" aria-hidden="true">
	<div
		class="absolute inset-0 rounded-full {state === 'lit'
			? 'bg-[radial-gradient(circle,rgba(217,150,60,.28),transparent_68%)]'
			: 'bg-[radial-gradient(circle,rgba(34,30,25,.08),transparent_68%)]'}"
	></div>
	<div
		class="absolute bottom-[30px] left-1/2 h-5 w-[54px] -translate-x-1/2 rounded-b-[30px] bg-linear-to-b from-[#c99a4a] to-[#7a5320]"
	></div>
	{#if state === 'lit'}
		<div
			class="absolute bottom-[50px] left-1/2 h-[26px] w-4 -translate-x-1/2 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-linear-to-b from-amber-light to-amber shadow-[0_0_18px_rgba(217,150,60,.8)]"
		></div>
	{:else}
		<div
			class="absolute bottom-[50px] left-1/2 box-border h-[26px] w-4 -translate-x-1/2 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] border-[1.5px] border-dashed border-ink/30"
		></div>
	{/if}
</div>
