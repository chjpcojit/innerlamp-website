<script lang="ts" generics="T extends string">
	interface Option {
		id: T;
		label: string;
		count?: number;
	}

	interface Props {
		options: Option[];
		/** Selected id, or `null` for "all". */
		value: T | null;
		allLabel: string;
		label: string;
		allCount?: number;
	}

	let { options, value = $bindable(), allLabel, label, allCount }: Props = $props();

	const chip =
		'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink/70 hover:bg-white';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label={label}>
	<button
		type="button"
		class="{chip} {value === null ? chipOn : chipOff}"
		aria-pressed={value === null}
		onclick={() => (value = null)}
	>
		{allLabel}
		{#if allCount !== undefined}<span class="opacity-60">{allCount}</span>{/if}
	</button>
	{#each options as o (o.id)}
		<button
			type="button"
			class="{chip} {value === o.id ? chipOn : chipOff}"
			aria-pressed={value === o.id}
			onclick={() => (value = o.id)}
		>
			{o.label}
			{#if o.count !== undefined}<span class="opacity-60">{o.count}</span>{/if}
		</button>
	{/each}
</div>
