<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { TempleOption, TempleOptionsPage } from '$lib/types/temple';
	import { sanghaErrorMessage } from '../errors';
	import type { SanghaError } from '../types';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		/** The user's current practice temple. */
		temple: { id: string; name: string };
	}

	let { temple }: Props = $props();

	const SEARCH_DELAY_MS = 250;

	let view = $state<'menu' | 'change' | 'leave' | null>(null);
	let dialog = $state<HTMLDialogElement>();
	let query = $state('');
	let selected = $state('');
	let results = $state<TempleOption[]>([]);
	let searchState = $state<'loading' | 'ready' | 'error'>('loading');
	/** Last page loaded for the current query, and how many exist. */
	let page = $state(1);
	let totalPages = $state(1);
	let moreState = $state<'idle' | 'loading' | 'error'>('idle');
	let moreController: AbortController | undefined;
	let pending = $state(false);
	let error = $state<SanghaError | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (view && !dialog.open) dialog.showModal();
		else if (!view && dialog.open) dialog.close();
	});

	/** One page of temple options through the server proxy (keeps the backend URL/key server-side). */
	async function fetchTemples(q: string, pageNo: number, signal: AbortSignal) {
		const params = new URLSearchParams(q ? { page: String(pageNo), q } : { page: String(pageNo) });
		const res = await fetch(`/api/temples?${params}`, { signal });
		if (!res.ok) throw new Error(`temples ${res.status}`);
		return (await res.json()) as TempleOptionsPage;
	}

	// First page for the current query; a new query drops any in-flight "load more".
	$effect(() => {
		if (view !== 'change') return;
		const q = query.trim();
		const controller = new AbortController();
		moreController?.abort();
		moreState = 'idle';
		searchState = 'loading';
		const timer = setTimeout(async () => {
			try {
				const data = await fetchTemples(q, 1, controller.signal);
				results = data.items;
				page = data.page;
				totalPages = data.total_pages;
				searchState = 'ready';
			} catch (e) {
				if (controller.signal.aborted) return;
				console.error('[sangha] temple search failed', e);
				searchState = 'error';
			}
		}, SEARCH_DELAY_MS);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	async function loadMore() {
		if (moreState === 'loading' || searchState !== 'ready' || page >= totalPages) return;
		const controller = new AbortController();
		moreController = controller;
		moreState = 'loading';
		try {
			const data = await fetchTemples(query.trim(), page + 1, controller.signal);
			// Skip ids already shown in case the list shifted between pages (keyed #each).
			const seen = new Set(results.map((t) => t.id));
			results = [...results, ...data.items.filter((t) => !seen.has(t.id))];
			page = data.page;
			totalPages = data.total_pages;
			moreState = 'idle';
		} catch (e) {
			if (controller.signal.aborted) return;
			console.error('[sangha] temple load more failed', e);
			moreState = 'error';
		}
	}

	function open(next: 'menu' | 'change' | 'leave') {
		error = null;
		if (next === 'change') {
			query = '';
			selected = temple.id;
		}
		view = next;
	}

	const close = () => (view = null);

	const submit: SubmitFunction = () => {
		pending = true;
		error = null;
		return async ({ result, update }) => {
			pending = false;
			if (result.type === 'failure') {
				error = (result.data?.sanghaError as SanghaError | undefined) ?? 'failed';
				return;
			}
			close();
			await update();
			if (result.type === 'success') window.scrollTo({ top: 0, behavior: 'smooth' });
		};
	};

	const outline =
		'cursor-pointer rounded-full border border-ink/16 px-5 py-3 text-[13px] font-medium transition-colors hover:bg-sand/60';
	const iconButton =
		'flex size-9 flex-none cursor-pointer items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-sand';
	const row =
		'flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-3.5 text-left transition-colors';
</script>

<button
	type="button"
	onclick={() => open('menu')}
	class="flex cursor-pointer items-center gap-1.5 rounded-full border border-cream/45 px-4 py-[11px] text-[13px] font-medium whitespace-nowrap text-cream transition-colors hover:bg-cream/10"
	aria-haspopup="dialog"
>
	{m.sg_settings()}
	<span class="text-[10px]" aria-hidden="true">▾</span>
</button>

<dialog
	bind:this={dialog}
	aria-labelledby="sg-settings-title"
	onclose={close}
	class="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 text-ink backdrop:bg-[#1a1611]/42"
>
	<div class="flex h-full overflow-y-auto p-5">
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			aria-label={m.sg_settings_close()}
			onclick={close}
		></button>
		<div
			class="relative m-auto w-full rounded-[26px] bg-paper shadow-[0_30px_80px_rgba(26,22,17,.25)] {view ===
			'leave'
				? 'max-w-[440px]'
				: 'max-w-[520px]'}"
		>
			{#if view === 'menu'}
				<header class="flex items-start justify-between gap-3 px-6 pt-[22px]">
					<div>
						<h2 id="sg-settings-title" class="font-serif text-[26px]/tight font-medium">
							{m.sg_settings()}
						</h2>
						<p class="mt-1 text-[13px] text-ink/55">
							{m.sg_settings_current({ name: temple.name })}
						</p>
					</div>
					<button
						type="button"
						class={iconButton}
						aria-label={m.sg_settings_close()}
						onclick={close}
					>
						<span class="text-[22px]/none" aria-hidden="true">×</span>
					</button>
				</header>
				<div class="px-3 pt-3.5 pb-4">
					<button type="button" class="{row} hover:bg-cream" onclick={() => open('change')}>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-medium">{m.sg_change_title()}</span>
							<span class="mt-0.5 block text-xs/normal text-ink/55">{m.sg_change_desc()}</span>
						</span>
						<span class="text-ink/35" aria-hidden="true">›</span>
					</button>
					<div class="mx-3 my-2 h-px bg-ink/7"></div>
					<button type="button" class="{row} hover:bg-[#a7443f]/6" onclick={() => open('leave')}>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-medium text-[#a7443f]">{m.sg_leave_action()}</span>
							<span class="mt-0.5 block text-xs/normal text-ink/55">{m.sg_leave_desc()}</span>
						</span>
					</button>
				</div>
			{:else if view === 'change'}
				<form method="POST" action="?/setSangha" use:enhance={submit}>
					<header class="flex items-center gap-2 px-6 pt-[22px]">
						<button
							type="button"
							class="{iconButton} size-8"
							aria-label={m.sg_settings_back()}
							onclick={() => open('menu')}
						>
							<span class="text-xl/none" aria-hidden="true">‹</span>
						</button>
						<h2 id="sg-settings-title" class="flex-1 font-serif text-[26px]/tight font-medium">
							{m.sg_change_title()}
						</h2>
						<button
							type="button"
							class={iconButton}
							aria-label={m.sg_settings_close()}
							onclick={close}
						>
							<span class="text-[22px]/none" aria-hidden="true">×</span>
						</button>
					</header>
					<div class="px-6 pt-3.5">
						<input
							type="search"
							bind:value={query}
							placeholder={m.sg_change_search()}
							aria-label={m.sg_change_search()}
							class="w-full rounded-full border border-ink/12 bg-cream px-4 py-[11px] text-sm outline-none focus:border-ink/30"
						/>
					</div>
					<fieldset class="px-3 pt-2.5" aria-busy={searchState === 'loading'}>
						<legend class="sr-only">{m.sg_change_title()}</legend>
						{#if searchState === 'error'}
							<p class="px-3 py-[18px] text-[13px] text-ink/55">{m.sg_change_search_error()}</p>
						{:else if searchState === 'ready' && results.length === 0}
							<p class="px-3 py-[18px] text-[13px] text-ink/55">{m.sg_change_empty()}</p>
						{:else}
							<div
								class="flex max-h-[min(50dvh,480px)] flex-col overflow-y-auto {searchState ===
								'loading'
									? 'opacity-60'
									: ''}"
							>
								{#each results as t (t.id)}
									{@const isCurrent = t.id === temple.id}
									<label
										class="flex cursor-pointer items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-cream has-checked:bg-cream"
									>
										<span class="min-w-0 flex-1">
											<span class="block text-sm font-medium">{t.name}</span>
											<span class="mt-0.5 block text-xs text-ink/55">
												{isCurrent ? m.sg_change_current({ place: t.province }) : t.province}
											</span>
										</span>
										<input
											type="radio"
											name="temple_id"
											value={t.id}
											bind:group={selected}
											class="size-5 flex-none cursor-pointer appearance-none rounded-full border-[1.5px] border-ink/25 checked:border-[6px] checked:border-gold"
										/>
									</label>
								{/each}
								{#if searchState === 'ready' && page < totalPages}
									<div class="flex flex-col items-center gap-1.5 px-3 py-2.5">
										{#if moreState === 'error'}
											<p class="text-[13px] text-ink/55" role="alert">
												{m.sg_change_search_error()}
											</p>
										{/if}
										<button
											type="button"
											class={outline}
											disabled={moreState === 'loading'}
											aria-busy={moreState === 'loading'}
											onclick={loadMore}
										>
											{moreState === 'loading' ? m.sg_change_loading() : m.sg_change_more()}
										</button>
									</div>
								{/if}
							</div>
						{/if}
					</fieldset>
					<p class="px-6 pt-2.5 text-xs/relaxed text-ink/55">{m.sg_change_note()}</p>
					{#if error}
						<p class="px-6 pt-2.5 text-[13px] text-[#a7443f]" role="alert">
							{sanghaErrorMessage(error)}
						</p>
					{/if}
					<div class="flex justify-end gap-2.5 px-6 pt-[18px] pb-[22px]">
						<button type="button" class={outline} onclick={() => open('menu')}>
							{m.sg_change_cancel()}
						</button>
						<button
							type="submit"
							disabled={pending || !selected || selected === temple.id}
							class="cursor-pointer rounded-full bg-amber px-[22px] py-3 text-[13px] font-medium text-[#1a1611] transition-colors hover:bg-[#e6a94e] disabled:cursor-default disabled:bg-sand disabled:text-ink/40"
						>
							{m.sg_change_confirm()}
						</button>
					</div>
				</form>
			{:else if view === 'leave'}
				<form
					method="POST"
					action="?/setSangha"
					use:enhance={submit}
					class="px-6 pt-[26px] pb-[22px]"
				>
					<input type="hidden" name="temple_id" value="" />
					<h2 id="sg-settings-title" class="font-serif text-[26px]/[1.2] font-medium">
						{m.sg_leave_title({ name: temple.name })}
					</h2>
					<ul class="mt-3 flex flex-col gap-1.5 text-[13px]/relaxed text-ink/70">
						{#each [m.sg_leave_point_1(), m.sg_leave_point_2(), m.sg_leave_point_3(), m.sg_leave_point_4()] as point (point)}
							<li class="flex gap-2"><span aria-hidden="true">•</span>{point}</li>
						{/each}
					</ul>
					{#if error}
						<p class="mt-3 text-[13px] text-[#a7443f]" role="alert">{sanghaErrorMessage(error)}</p>
					{/if}
					<div class="mt-[22px] flex justify-end gap-2.5">
						<button type="button" class={outline} onclick={() => open('menu')}>
							{m.sg_leave_stay()}
						</button>
						<button
							type="submit"
							disabled={pending}
							class="cursor-pointer rounded-full bg-[#a7443f] px-[22px] py-3 text-[13px] font-medium text-paper transition-colors hover:bg-[#8f3833] disabled:opacity-60"
						>
							{m.sg_leave_action()}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</dialog>
