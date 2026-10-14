<script lang="ts" module>
	export interface SearchOption {
		value: string;
		label: string;
		/** Muted secondary text beside the label (e.g. the unit type). */
		sub?: string;
	}
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { fold } from '$lib/utils/text';

	interface Props {
		label: string;
		/** Small hint on the right of the label row (e.g. "34 provinces"). */
		note?: string;
		placeholder: string;
		searchPlaceholder: string;
		options: SearchOption[];
		/** Selected option value, or `null`. */
		value: string | null;
		disabled?: boolean;
		loading?: boolean;
		failed?: boolean;
		onselect: (value: string) => void;
		onretry?: () => void;
	}

	let {
		label,
		note = '',
		placeholder,
		searchPlaceholder,
		options,
		value,
		disabled = false,
		loading = false,
		failed = false,
		onselect,
		onretry
	}: Props = $props();

	let root: HTMLDivElement | undefined = $state();
	let open = $state(false);
	let query = $state('');

	const selected = $derived(options.find((o) => o.value === value));
	const shown = $derived.by(() => {
		const q = fold(query.trim());
		return q ? options.filter((o) => fold(`${o.label} ${o.sub ?? ''}`).includes(q)) : options;
	});

	function toggle() {
		if (disabled) return;
		open = !open;
		query = '';
	}

	function pick(v: string) {
		open = false;
		query = '';
		onselect(v);
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclick={onWindowClick} />

<div
	bind:this={root}
	class="relative {open ? 'z-30' : 'z-10'}"
	onkeydown={(e) => e.key === 'Escape' && open && (open = false)}
	role="presentation"
>
	<button
		type="button"
		aria-expanded={open}
		aria-haspopup="listbox"
		{disabled}
		onclick={toggle}
		class="flex w-full items-center gap-3 rounded-2xl border bg-paper px-4 py-3 text-left select-none {open
			? 'border-gold/55'
			: 'border-ink/12'} {disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'}"
	>
		<span class="min-w-0 flex-1">
			<span class="flex items-baseline justify-between gap-2">
				<span class="text-[11px] text-ink/45">{label}</span>
				{#if note}<span class="text-[10.5px] text-ink/38">{note}</span>{/if}
			</span>
			<span class="mt-[3px] block truncate text-[15px] {selected ? '' : 'text-ink/42'}">
				{selected ? selected.label : placeholder}
			</span>
		</span>
		<span
			class="size-[7px] flex-none border-r-[1.5px] border-b-[1.5px] border-ink/45 transition-transform duration-200 {open
				? 'translate-x-[-2px] translate-y-[-2px] rotate-[225deg]'
				: 'translate-x-[-2px] translate-y-[-2px] rotate-45'}"
			aria-hidden="true"
		></span>
	</button>

	{#if open}
		<div
			class="absolute inset-x-0 top-[calc(100%+6px)] flex max-h-[340px] flex-col overflow-hidden rounded-2xl border border-ink/12 bg-paper shadow-[0_16px_40px_rgba(34,30,25,.16)]"
		>
			<div class="flex-none border-b border-ink/7 px-4 py-2.5">
				<input
					use:focusOnMount
					bind:value={query}
					type="search"
					autocomplete="off"
					aria-label={searchPlaceholder}
					placeholder={searchPlaceholder}
					class="w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-ink/35"
				/>
			</div>
			<ul role="listbox" class="min-h-0 flex-1 overflow-y-auto">
				{#each shown as o, i (o.value)}
					<li
						role="option"
						aria-selected={o.value === value}
						class={i ? 'border-t border-ink/7' : ''}
					>
						<button
							type="button"
							onclick={() => pick(o.value)}
							class="flex w-full cursor-pointer items-baseline gap-2 px-4 py-[11px] text-left hover:bg-ink/4 {o.value ===
							value
								? 'bg-gold/8'
								: ''}"
						>
							<span class="text-sm">{o.label}</span>
							{#if o.sub}<span class="text-[11.5px] text-ink/42">{o.sub}</span>{/if}
						</button>
					</li>
				{/each}
				{#if loading}
					<li class="px-4 py-[18px] text-center text-[13px] text-ink/45" aria-live="polite">
						{m.select_loading()}
					</li>
				{:else if failed}
					<li
						class="flex items-center justify-center gap-3 px-4 py-[18px] text-[13px]"
						role="alert"
					>
						<span class="text-[#9A5F58]">{m.select_load_error()}</span>
						{#if onretry}
							<button
								type="button"
								onclick={onretry}
								class="cursor-pointer font-medium text-gold-deep"
							>
								{m.select_retry()}
							</button>
						{/if}
					</li>
				{:else if shown.length === 0 && query.trim()}
					<li class="px-4 py-[18px] text-center text-[13px] text-ink/45">
						{m.select_no_results({ query: query.trim() })}
					</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
