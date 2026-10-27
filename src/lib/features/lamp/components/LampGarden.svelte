<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { LAMP_TYPES } from '$lib/content/lamps';
	import LampCard from '$lib/features/lamp/components/LampCard.svelte';
	import { remainingUntil } from '$lib/features/lamp/remaining';
	import { GardenState } from '$lib/features/lamp/state/garden.svelte';
	import type { LampGardenPage } from '$lib/types/lamp';

	interface Props {
		/** First unfiltered page; null when the backend failed. / Trang đầu; null khi backend lỗi. */
		garden: LampGardenPage | null;
		/** Brings the form into view. / Cuộn về form thắp đèn. */
		onToForm: () => void;
	}

	let { garden, onToForm }: Props = $props();

	// A fresh state whenever the page data reloads (e.g. after lighting), back on "All".
	// / Tạo state mới mỗi khi dữ liệu trang tải lại (vd. sau khi thắp), bộ lọc về "Tất cả".
	const view = $derived(garden ? new GardenState(garden) : null);

	// Labels are computed when a page of lamps renders; no live countdown. Expired cards are dropped.
	// / Nhãn tính khi render; không đếm ngược trực tiếp. Đèn đã tắt không hiển thị.
	const cards = $derived.by(() => {
		const now = Date.now();
		return (view?.items ?? []).flatMap((lamp) => {
			const remaining = remainingUntil(lamp.end_at, now);
			return remaining.kind === 'out' ? [] : [{ lamp, remaining }];
		});
	});

	const count = $derived((view?.total ?? 0).toLocaleString(getLocale()));
	const tabs = $derived([
		{ id: null, label: m.lamp_wall_all(), n: view?.total ?? 0 },
		...LAMP_TYPES.map((t) => ({ id: t.code, label: t.name(), n: view?.counts[t.code] ?? 0 }))
	]);

	const chip =
		'flex cursor-pointer gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors';
	const link =
		'cursor-pointer text-[13px] font-medium text-[#e8b061] underline-offset-4 hover:underline';
</script>

<section
	data-keep-dark
	aria-labelledby="lamp-garden"
	class="scroll-mt-6 rounded-[28px] bg-[#14110d] p-[clamp(22px,3vw,36px)] text-[#f5eee0]"
>
	<div class="mb-5 flex flex-wrap items-baseline justify-between gap-3">
		<h2 id="lamp-garden" class="scroll-mt-10 font-serif text-[28px] font-medium">
			{m.lamp_wall_title()}
		</h2>
		<div class="flex flex-wrap items-baseline gap-4">
			{#if view && !view.empty}
				<p class="text-[13px] text-[#f2ebdd]/55">{m.lamp_wall_count({ count })}</p>
			{/if}
			<button type="button" class={link} onclick={onToForm}>{m.lamp_to_form()}</button>
		</div>
	</div>

	{#if !view}
		<p class="text-sm text-[#f2ebdd]/65" role="alert">{m.lamp_wall_error()}</p>
	{:else if view.empty}
		<div class="flex flex-col items-center gap-3 py-8 text-center">
			<h3 class="font-serif text-[22px] font-medium">{m.lamp_wall_empty_title()}</h3>
			<p class="max-w-[360px] text-sm text-[#f2ebdd]/65">{m.lamp_wall_empty_body()}</p>
			<button
				type="button"
				onclick={onToForm}
				class="mt-2 cursor-pointer rounded-full bg-amber px-6 py-[13px] text-sm font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#e6a94e]"
			>
				{m.lamp_to_form()}
			</button>
		</div>
	{:else}
		<div class="mb-[18px] flex flex-wrap gap-2" role="group" aria-label={m.lamp_wall_filter()}>
			{#each tabs as t (t.id)}
				<button
					type="button"
					aria-pressed={view.filter === t.id}
					disabled={view.loading}
					onclick={() => view.pick(t.id)}
					class="{chip} {view.filter === t.id
						? 'border-amber-light bg-amber-light text-[#1a1611]'
						: 'border-[#f2ebdd]/14 bg-[#f2ebdd]/5 text-[#f2ebdd] hover:bg-[#f2ebdd]/10'}"
				>
					{t.label}<span class="opacity-60">{t.n}</span>
				</button>
			{/each}
		</div>

		{#if cards.length}
			<ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
				{#each cards as c (c.lamp.id)}
					<LampCard lamp={c.lamp} remaining={c.remaining} />
				{/each}
			</ul>
		{/if}

		{#if view.failed}
			<p class="mt-[18px] text-center text-[13px] text-[#f0a49e]" role="alert">
				{m.lamp_wall_error()}
			</p>
		{/if}

		{#if view.hasMore}
			<div class="mt-[18px] flex justify-center">
				<button
					type="button"
					disabled={view.loading}
					onclick={() => view.more()}
					class="cursor-pointer rounded-full border border-[#f2ebdd]/20 px-5 py-2.5 text-[13px] font-medium text-[#f2ebdd] hover:bg-[#f2ebdd]/6 disabled:opacity-60"
				>
					{m.lamp_wall_more()}
				</button>
			</div>
		{/if}
	{/if}
</section>
