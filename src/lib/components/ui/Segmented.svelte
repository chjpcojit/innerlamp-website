<script lang="ts" generics="T extends string | number">
	interface Option {
		value: T;
		label: string;
		/** Renders the option as a link (e.g. a language switch) instead of a button. */
		href?: string;
	}

	interface Props {
		options: Option[];
		value: T;
		label: string;
		onchange?: (next: T) => void;
	}

	let { options, value, label, onchange }: Props = $props();

	const base =
		'rounded-full px-3.5 py-[7px] text-xs font-medium whitespace-nowrap transition-colors';
	const on = 'bg-paper text-ink shadow-[0_1px_3px_rgba(34,30,25,.12)]';
	const off = 'text-ink/55 hover:text-ink/80';
</script>

<div class="flex gap-0.5 rounded-full bg-ink/6 p-[3px]" role="group" aria-label={label}>
	<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
	{#each options as o (o.value)}
		{#if o.href}
			<a
				href={o.href}
				hreflang={String(o.value)}
				aria-current={o.value === value ? 'true' : undefined}
				class="{base} {o.value === value ? on : off}"
			>
				{o.label}
			</a>
		{:else}
			<button
				type="button"
				aria-pressed={o.value === value}
				onclick={() => onchange?.(o.value)}
				class="{base} cursor-pointer {o.value === value ? on : off}"
			>
				{o.label}
			</button>
		{/if}
	{/each}
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>
