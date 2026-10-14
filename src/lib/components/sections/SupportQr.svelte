<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import {
		SUPPORT_PAYMENTS,
		SUPPORT_QR_TTL,
		SUPPORT_RECIPIENT,
		supportMemo
	} from '$lib/content/support';
	import { formatVnd } from '$lib/utils/money';
	import { placeholderQr } from '$lib/utils/qr-placeholder';

	interface Props {
		amount: number;
		payment: number;
		onback: () => void;
		onpaid: () => void;
	}

	let { amount, payment, onback, onpaid }: Props = $props();

	const locale = getLocale();
	const method = $derived(SUPPORT_PAYMENTS[payment]);
	const amountLabel = $derived(formatVnd(amount, locale));
	const memo = $derived(supportMemo(amount, payment));
	const qr = $derived(placeholderQr(amount + payment * 977 + 31));
	const rows = $derived([
		{ id: 'recipient', k: m.sup_info_recipient(), v: SUPPORT_RECIPIENT, copy: false },
		{ id: 'amount', k: m.sup_info_amount(), v: amountLabel, copy: false },
		{ id: 'memo', k: m.sup_info_memo(), v: memo, copy: true }
	]);

	let left = $state(SUPPORT_QR_TTL);
	let copied = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const end = Date.now() + SUPPORT_QR_TTL * 1000;
		const tick = () => (left = Math.max(0, Math.round((end - Date.now()) / 1000)));
		tick();
		const timer = setInterval(tick, 1000);
		return () => clearInterval(timer);
	});

	const clock = $derived(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);

	async function copy(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// clipboard unavailable (insecure context / denied) — the value stays selectable on screen
		}
		copied = id;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = null), 1600);
	}
</script>

<div class="flex flex-col items-center gap-4">
	<button
		type="button"
		onclick={onback}
		class="flex cursor-pointer items-center gap-2 self-start text-[13px] font-medium text-ink/55 transition-colors hover:text-ink"
	>
		<span
			aria-hidden="true"
			class="size-[7px] rotate-45 border-b-[1.5px] border-l-[1.5px] border-current"
		></span>
		{m.sup_edit_amount()}
	</button>

	<h2 class="text-[10.5px] font-semibold tracking-[.14em] text-ink/50 uppercase">
		{m.sup_qr_title({ method: method.label() })}
	</h2>

	<svg
		viewBox="0 0 25 25"
		role="img"
		aria-label={m.sup_qr_alt()}
		shape-rendering="crispEdges"
		class="size-[228px] rounded-[18px] border border-ink/10 bg-white p-3.5 shadow-[0_10px_30px_rgba(34,30,25,.08)]"
	>
		{#each qr as on, i (i)}
			{#if on}<rect x={i % 25} y={Math.floor(i / 25)} width="1" height="1" fill="#221E19" />{/if}
		{/each}
	</svg>

	<div class="text-center">
		<p class="font-serif text-[40px]/[1.1] font-medium">{amountLabel}</p>
		<p class="mt-1.5 max-w-[300px] text-[12.5px]/relaxed text-pretty text-ink/55">
			{method.hint()}
		</p>
	</div>

	<dl class="w-full rounded-2xl bg-cream-soft px-4 py-1">
		{#each rows as r, i (r.id)}
			<div
				class="flex items-center gap-3 py-[11px] {i < rows.length - 1
					? 'border-b border-ink/7'
					: ''}"
			>
				<div class="min-w-0 flex-1">
					<dt class="text-[11.5px] text-ink/50">{r.k}</dt>
					<dd class="mt-0.5 text-sm font-medium break-words">{r.v}</dd>
				</div>
				{#if r.copy}
					<button
						type="button"
						onclick={() => copy(r.id, r.v)}
						class="cursor-pointer rounded-full border border-ink/14 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-sand/60"
					>
						{copied === r.id ? m.sup_copied() : m.sup_copy()}
					</button>
				{/if}
			</div>
		{/each}
	</dl>

	<p class="flex items-center gap-2.5 text-[12.5px] text-ink/55">
		<span aria-hidden="true" class="size-2 rounded-full bg-gold motion-safe:animate-pulse"></span>
		{m.sup_waiting({ time: clock })}
	</p>

	<button
		type="button"
		onclick={onpaid}
		class="w-full cursor-pointer rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-[#3a332b]"
	>
		{m.sup_paid()}
	</button>
</div>
