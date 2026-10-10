<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { OfferFlow } from '$lib/state/offer.svelte';
	import { formatVnd } from '$lib/utils/money';

	interface Props {
		flow: OfferFlow;
		onconfirm: () => void;
	}

	let { flow, onconfirm }: Props = $props();

	const locale = getLocale();
	const amount = $derived(formatVnd(flow.amount, locale));
	const rows = $derived([
		{ id: 'bank', k: m.offer_bank_name(), v: flow.templeInfo.bank, copy: false },
		{ id: 'account', k: m.offer_bank_account(), v: flow.templeInfo.account, copy: true },
		{ id: 'holder', k: m.offer_bank_holder(), v: flow.templeInfo.holder, copy: false },
		{ id: 'amount', k: m.offer_bank_amount(), v: amount, copy: true },
		{ id: 'memo', k: m.offer_bank_memo(), v: flow.memo, copy: true }
	]);

	let copied = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// clipboard unavailable (insecure context / denied) — the value stays selectable on screen
		}
		copied = id;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = null), 1600);
	}

	const qr = $derived(flow.qr);
</script>

<div class="flex max-w-[960px] flex-wrap items-start gap-6">
	<section
		aria-labelledby="offer-qr-title"
		class="flex min-w-[260px] flex-[0_1_340px] flex-col items-center gap-3.5 rounded-[22px] border border-ink/8 bg-paper p-6"
	>
		<h2
			id="offer-qr-title"
			class="text-[10.5px] font-semibold tracking-[.14em] text-ink/50 uppercase"
		>
			{m.offer_qr_title()}
		</h2>
		<svg
			viewBox="0 0 25 25"
			role="img"
			aria-label={m.offer_qr_alt()}
			shape-rendering="crispEdges"
			class="size-[220px] rounded-2xl border border-ink/10 bg-white p-3"
		>
			{#each qr as on, i (i)}
				{#if on}<rect x={i % 25} y={Math.floor(i / 25)} width="1" height="1" fill="#221E19" />{/if}
			{/each}
		</svg>
		<p class="font-serif text-[40px] font-medium">{amount}</p>
		<p class="text-center text-xs text-ink/50">{m.offer_qr_hint()}</p>
	</section>

	<div class="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5">
		<dl class="rounded-[22px] border border-ink/8 bg-paper px-[22px] py-1.5">
			{#each rows as r, i (r.id)}
				<div
					class="flex items-center gap-3 py-3.5 {i < rows.length - 1
						? 'border-b border-ink/7'
						: ''}"
				>
					<div class="min-w-0 flex-1">
						<dt class="text-xs text-ink/50">{r.k}</dt>
						<dd class="mt-[3px] text-[15px] font-medium break-words">{r.v}</dd>
					</div>
					{#if r.copy}
						<button
							type="button"
							onclick={() => copy(r.id, r.v)}
							class="cursor-pointer rounded-full border border-ink/14 px-[13px] py-[7px] text-xs font-medium whitespace-nowrap hover:bg-sand/60"
						>
							{copied === r.id ? m.offer_copied() : m.offer_copy()}
						</button>
					{/if}
				</div>
			{/each}
		</dl>
		<p class="rounded-2xl bg-gold/10 px-4 py-3.5 text-[13px]/[1.6] text-pretty text-[#74500f]">
			{m.offer_memo_note()}
		</p>
		<div class="flex flex-wrap gap-2.5">
			<button
				type="button"
				onclick={onconfirm}
				class="flex-1 cursor-pointer rounded-full bg-ink px-6 py-3.5 text-sm font-medium whitespace-nowrap text-cream hover:bg-[#3a342c]"
			>
				{m.offer_transferred()}
			</button>
			<button
				type="button"
				onclick={() => flow.back()}
				class="cursor-pointer rounded-full border border-ink/16 px-[22px] py-3.5 text-sm font-medium whitespace-nowrap hover:bg-sand/60"
			>
				{m.offer_edit()}
			</button>
		</div>
	</div>
</div>
