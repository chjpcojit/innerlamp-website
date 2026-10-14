<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PendingTemple, TempleOption, TempleOptionsPage } from '$lib/types/temple';

	interface Props {
		/** Chosen temple, or `null` for "not ordained" / nothing picked. */
		value?: TempleOption | null;
		/**
		 * A proposed temple awaiting review. Shown as the selection but not sent as the
		 * place of ordination (it has no id yet); picking any other row clears it.
		 */
		pending?: PendingTemple | null;
		/** "Can't find your temple?" row was chosen; the row is hidden when omitted. */
		onadd?: () => void;
		/**
		 * `boxed`: label inside the trigger (sign-up). `field`: plain 46px input look whose
		 * label sits outside, referenced through `labelledby` (profile edit).
		 */
		variant?: 'boxed' | 'field';
		/** Id of the external label element (`field` variant). */
		labelledby?: string;
		/** Text of the "no temple" row; defaults to the sign-up wording. */
		noneLabel?: string;
		noneSub?: string;
	}

	let {
		value = $bindable(null),
		pending = $bindable(null),
		onadd,
		variant = 'boxed',
		labelledby,
		noneLabel = m.temple_none(),
		noneSub = m.temple_none_sub()
	}: Props = $props();

	let root: HTMLDivElement | undefined = $state();
	let open = $state(false);
	let query = $state('');
	let items = $state<TempleOption[]>([]);
	let page = $state(0);
	let totalPages = $state(0);
	let loading = $state(false);
	let failed = $state(false);
	let loaded = $state(false);

	let controller: AbortController | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const hasMore = $derived(page < totalPages);

	async function load(reset: boolean) {
		controller?.abort();
		controller = new AbortController();
		loading = true;
		failed = false;
		try {
			const q = encodeURIComponent(query.trim());
			const url = `/api/temples?page=${reset ? 1 : page + 1}${q ? `&q=${q}` : ''}`;
			const res = await fetch(url, { signal: controller.signal });
			if (!res.ok) throw new Error(String(res.status));
			const data: TempleOptionsPage = await res.json();
			items = reset ? data.items : [...items, ...data.items];
			page = data.page;
			totalPages = data.total_pages;
			loaded = true;
			loading = false;
		} catch (e) {
			// A newer request superseded this one and owns the loading state.
			if (e instanceof DOMException && e.name === 'AbortError') return;
			failed = true;
			loading = false;
		}
	}

	function toggle() {
		open = !open;
		if (open && !loaded) load(true);
	}

	function onSearch() {
		clearTimeout(timer);
		timer = setTimeout(() => load(true), 300);
	}

	function pick(temple: TempleOption | null) {
		value = temple;
		pending = null;
		open = false;
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}

	const field = 'rounded-2xl border bg-paper px-4 py-3';
	const row = 'flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left hover:bg-ink/4';
</script>

<svelte:window onclick={onWindowClick} />

<div
	bind:this={root}
	class="relative z-20"
	onkeydown={(e) => e.key === 'Escape' && open && (open = false)}
	role="presentation"
>
	<input type="hidden" name="ordination_temple_id" value={value?.id ?? ''} />
	{#if variant === 'field'}
		<button
			type="button"
			aria-expanded={open}
			aria-labelledby={labelledby}
			onclick={toggle}
			class="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-[14px] border bg-paper px-3.5 text-left text-sm select-none {open
				? 'border-gold'
				: 'border-ink/12'}"
		>
			<span class="min-w-0 flex-1 truncate">{value?.name ?? pending?.name ?? noneLabel}</span>
			<span
				class="size-[7px] flex-none translate-x-[-2px] border-r-[1.5px] border-b-[1.5px] border-ink/45 transition-transform duration-200 {open
					? 'rotate-[225deg]'
					: 'translate-y-[-2px] rotate-45'}"
				aria-hidden="true"
			></span>
		</button>
	{:else}
		<button
			type="button"
			aria-expanded={open}
			onclick={toggle}
			class="{field} flex w-full cursor-pointer items-center gap-3 text-left select-none {open
				? 'border-gold/55'
				: 'border-ink/12'}"
		>
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="text-[11px] text-ink/45">{m.signup_temple_label()}</span>
					<span class="text-[10.5px] text-ink/38">{m.signup_temple_optional()}</span>
				</span>
				<span class="mt-[3px] block truncate text-[15px] {value || pending ? '' : 'text-ink/42'}">
					{value?.name ?? pending?.name ?? m.signup_temple_placeholder()}
				</span>
			</span>
			<span
				class="size-[7px] flex-none border-r-[1.5px] border-b-[1.5px] border-ink/45 transition-transform duration-200 {open
					? 'translate-x-[-2px] translate-y-[-2px] rotate-[225deg]'
					: 'translate-x-[-2px] translate-y-[-2px] rotate-45'}"
				aria-hidden="true"
			></span>
		</button>
	{/if}

	{#if open}
		<div
			class="absolute inset-x-0 top-[calc(100%+6px)] overflow-hidden rounded-2xl border border-ink/12 bg-paper shadow-[0_16px_40px_rgba(34,30,25,.16)]"
		>
			<div class="border-b border-ink/7 px-4 py-2.5">
				<input
					use:focusOnMount
					bind:value={query}
					oninput={onSearch}
					type="search"
					autocomplete="off"
					aria-label={m.signup_temple_search_placeholder()}
					placeholder={m.signup_temple_search_placeholder()}
					class="w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-ink/35"
				/>
			</div>
			<ul class="max-h-[244px] overflow-y-auto">
				<li>
					<button
						type="button"
						onclick={() => pick(null)}
						class="{row} {value || pending ? '' : 'bg-gold/8'}"
					>
						<span class="min-w-0 flex-1">
							<span class="block text-sm">{noneLabel}</span>
							<span class="mt-0.5 block text-[11px] text-ink/45">{noneSub}</span>
						</span>
					</button>
				</li>
				{#if pending}
					<li class="border-t border-ink/7">
						<button type="button" onclick={() => (open = false)} class="{row} bg-gold/8">
							<span class="min-w-0 flex-1">
								<span class="block text-sm">{pending.name}</span>
								<span class="mt-0.5 block text-[11px] text-ink/45">
									{pending.ward}, {pending.province} · {m.signup_temple_pending_tag()}
								</span>
							</span>
						</button>
					</li>
				{/if}
				{#each items as t (t.id)}
					<li class="border-t border-ink/7">
						<button
							type="button"
							onclick={() => pick(t)}
							class="{row} {t.id === value?.id ? 'bg-gold/8' : ''}"
						>
							<span class="min-w-0 flex-1">
								<span class="block text-sm">{t.name}</span>
								<span class="mt-0.5 block text-[11px] text-ink/45">{t.province}</span>
							</span>
						</button>
					</li>
				{/each}
				{#if loading}
					<li class="border-t border-ink/7 px-4 py-3 text-xs text-ink/45" aria-live="polite">
						{m.signup_temple_loading()}
					</li>
				{:else if failed}
					<li class="flex items-center gap-3 border-t border-ink/7 px-4 py-3 text-xs" role="alert">
						<span class="flex-1 text-[#9A5F58]">{m.signup_temple_error()}</span>
						<button
							type="button"
							onclick={() => load(items.length === 0)}
							class="cursor-pointer font-medium text-gold-deep"
						>
							{m.signup_temple_retry()}
						</button>
					</li>
				{:else if loaded && items.length === 0}
					<li class="border-t border-ink/7 px-4 py-3 text-xs text-ink/45">
						{m.signup_temple_empty()}
					</li>
				{:else if hasMore}
					<li class="border-t border-ink/7">
						<button
							type="button"
							onclick={() => load(false)}
							class="w-full cursor-pointer px-4 py-3 text-center text-xs font-medium text-gold-deep"
						>
							{m.signup_temple_load_more()}
						</button>
					</li>
				{/if}
			</ul>
			{#if onadd}
				<button
					type="button"
					onclick={() => {
						open = false;
						onadd();
					}}
					class="flex w-full cursor-pointer items-center gap-2.5 border-t border-ink/7 bg-[#FBF7EF] px-4 py-3 text-left hover:bg-[#F5EEDF]"
				>
					<span
						class="flex size-[22px] flex-none items-center justify-center rounded-full bg-gold/16 text-[15px] leading-none font-medium text-gold-deep"
						aria-hidden="true">+</span
					>
					<span class="min-w-0 flex-1">
						<span class="block text-[13px] font-medium text-gold-deep"
							>{m.signup_temple_add_title()}</span
						>
						<span class="mt-0.5 block text-xs text-ink/50">{m.signup_temple_add_sub()}</span>
					</span>
				</button>
			{/if}
		</div>
	{/if}
</div>
