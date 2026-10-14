<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import { LAMP_TYPES, lampType } from '$lib/content/lamps';
	import { daysLeft, lamps } from '$lib/state/lamps.svelte';
	import type { LampGardenPage, LampTypeCode } from '$lib/types/lamp';

	interface Props {
		/** First unfiltered page; null for guests or when the backend failed. */
		garden: LampGardenPage | null;
		isGuest: boolean;
	}

	let { garden, isGuest }: Props = $props();

	interface View {
		/** `null` shows every type. */
		filter: LampTypeCode | null;
		items: LampGardenPage['items'];
		cursor: string | null;
		hasMore: boolean;
	}

	// Resets to the unfiltered first page whenever the page data reloads (e.g. after lighting).
	let view = $derived<View>({
		filter: null,
		items: garden?.items ?? [],
		cursor: garden?.next_cursor ?? null,
		hasMore: garden?.has_more ?? false
	});
	let loading = $state(false);
	let failed = $state(false);

	const count = $derived((garden?.total ?? 0).toLocaleString(getLocale()));
	const tabs = $derived([
		{ id: null, label: m.lamp_wall_all(), n: garden?.total ?? 0 },
		...LAMP_TYPES.map((t) => ({ id: t.code, label: t.name(), n: garden?.counts[t.code] ?? 0 }))
	]);

	async function fetchPage(filter: LampTypeCode | null, cursor: string | null) {
		const params = new URLSearchParams({
			...(filter && { lamp_type: filter }),
			...(cursor && { cursor })
		});
		loading = true;
		failed = false;
		try {
			const res = await fetch(`/api/lamps?${params}`);
			if (!res.ok) throw new Error(`lamps ${res.status}`);
			return (await res.json()) as LampGardenPage;
		} catch (e) {
			console.error('[lamps] garden page failed', e);
			failed = true;
			return null;
		} finally {
			loading = false;
		}
	}

	async function pick(filter: LampTypeCode | null) {
		if (loading || filter === view.filter) return;
		const page = await fetchPage(filter, null);
		if (page)
			view = { filter, items: page.items, cursor: page.next_cursor, hasMore: page.has_more };
	}

	async function more() {
		if (loading || !view.cursor) return;
		const page = await fetchPage(view.filter, view.cursor);
		if (page)
			view = {
				...view,
				items: [...view.items, ...page.items],
				cursor: page.next_cursor,
				hasMore: page.has_more
			};
	}

	const chip =
		'flex cursor-pointer gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors';
</script>

<section
	data-keep-dark
	aria-labelledby="lamp-garden"
	class="rounded-[28px] bg-[#14110d] p-[clamp(22px,3vw,36px)] text-[#f5eee0]"
>
	<div class="mb-5 flex flex-wrap items-baseline justify-between gap-3">
		<h2 id="lamp-garden" class="font-serif text-[28px] font-medium">{m.lamp_wall_title()}</h2>
		{#if garden}
			<p class="text-[13px] text-[#f2ebdd]/55">{m.lamp_wall_count({ count })}</p>
		{/if}
	</div>

	{#if isGuest}
		<div class="flex flex-wrap items-center gap-4">
			<p class="text-sm text-[#f2ebdd]/65">{m.lamp_wall_guest()}</p>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
			<a
				href={localizeHref('/login')}
				class="rounded-full bg-amber-light px-[18px] py-[11px] text-[13px] font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#f7d38f]"
			>
				{m.header_login()}
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	{:else if !garden}
		<p class="text-sm text-[#f2ebdd]/65" role="alert">{m.lamp_wall_error()}</p>
	{:else}
		<div class="mb-[18px] flex flex-wrap gap-2" role="group" aria-label={m.lamp_wall_filter()}>
			{#each tabs as t (t.id)}
				<button
					type="button"
					aria-pressed={view.filter === t.id}
					disabled={loading}
					onclick={() => pick(t.id)}
					class="{chip} {view.filter === t.id
						? 'border-amber-light bg-amber-light text-[#1a1611]'
						: 'border-[#f2ebdd]/14 bg-[#f2ebdd]/5 text-[#f2ebdd] hover:bg-[#f2ebdd]/10'}"
				>
					{t.label}<span class="opacity-60">{t.n}</span>
				</button>
			{/each}
		</div>

		{#if view.items.length}
			<ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
				{#each view.items as w (w.id)}
					{@const mine = lamps.has(w.id)}
					<li
						class="flex h-52 min-w-0 flex-col items-center rounded-[18px] border px-3.5 pt-4 pb-3.5 text-center {mine
							? 'border-amber-light/50 bg-amber-light/8'
							: 'border-[#f2ebdd]/8 bg-[#f2ebdd]/4'}"
					>
						<LampVessel type={lampType(w.lamp_type)} mode="lit" size="mini" />
						<span
							class="mt-2.5 rounded-full bg-amber-light/12 px-[9px] py-[3px] text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap text-[#e8b061]"
						>
							{lampType(w.lamp_type).name()}
						</span>
						<p class="mt-2 w-full truncate text-[13px] font-medium">
							{mine ? m.lamp_wall_you() : w.lighter_name || m.lamp_wall_anonymous()}
						</p>
						<p class="mt-[3px] w-full truncate text-xs text-[#f2ebdd]/55">
							{m.lamp_to_person({ name: w.recipient })}
						</p>
						<p class="mt-auto text-xs text-[#e8b061]">
							{m.lamp_days_left({ count: daysLeft(w.end_at) })}
						</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-[#f2ebdd]/65">{m.lamp_wall_empty()}</p>
		{/if}

		{#if failed}
			<p class="mt-[18px] text-center text-[13px] text-[#f0a49e]" role="alert">
				{m.lamp_wall_error()}
			</p>
		{/if}

		{#if view.hasMore}
			<div class="mt-[18px] flex justify-center">
				<button
					type="button"
					disabled={loading}
					onclick={more}
					class="cursor-pointer rounded-full border border-[#f2ebdd]/20 px-5 py-2.5 text-[13px] font-medium text-[#f2ebdd] hover:bg-[#f2ebdd]/6 disabled:opacity-60"
				>
					{m.lamp_wall_more()}
				</button>
			</div>
		{/if}
	{/if}
</section>
