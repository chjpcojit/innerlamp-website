<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import SupportQr from '$lib/components/sections/SupportQr.svelte';
	import {
		SUPPORT_AMOUNTS,
		SUPPORT_CUSTOM,
		SUPPORT_DEFAULT_AMOUNT,
		SUPPORT_MIN_AMOUNT,
		SUPPORT_PAYMENTS
	} from '$lib/content/support';
	import { formatVnd } from '$lib/utils/money';

	const locale = getLocale();

	let preset = $state(SUPPORT_DEFAULT_AMOUNT);
	let custom = $state('');
	let payment = $state(0);
	let message = $state('');
	let anonymous = $state(false);
	let error = $state(false);
	let step = $state<'form' | 'qr' | 'done'>('form');
	let sent = $state({ amount: 0, payment: 0 });

	const amount = $derived(
		preset === SUPPORT_CUSTOM ? parseInt(custom.replace(/\D/g, ''), 10) || 0 : preset
	);

	function onCustomInput(e: Event & { currentTarget: HTMLInputElement }) {
		const digits = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
		custom = digits ? Number(digits).toLocaleString(locale) : '';
		error = false;
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (amount < SUPPORT_MIN_AMOUNT) {
			error = true;
			return;
		}
		sent = { amount, payment };
		step = 'qr';
	}

	function again() {
		step = 'form';
		message = '';
		error = false;
	}

	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink/72 hover:bg-white';
	const label = 'mb-2.5 block text-xs font-medium text-ink/55';
</script>

<div
	class="flex flex-col gap-[22px] rounded-[22px] border border-ink/8 bg-paper p-[clamp(20px,3vw,28px)]"
>
	{#if step === 'qr'}
		<SupportQr
			amount={sent.amount}
			payment={sent.payment}
			onback={() => (step = 'form')}
			onpaid={() => (step = 'done')}
		/>
	{:else if step === 'done'}
		<div class="flex flex-col items-center gap-2.5 py-5 text-center" role="status">
			<Icon kind="lotus" tone="#6e8f7a" tint="rgba(110,143,122,.16)" size={52} />
			<h2 class="mt-1.5 font-serif text-[28px]/tight font-medium">{m.sup_done_title()}</h2>
			<p class="max-w-[340px] text-sm/relaxed text-pretty text-ink/60">
				{m.sup_done_text({
					amount: formatVnd(sent.amount, locale),
					method: SUPPORT_PAYMENTS[sent.payment].label()
				})}
			</p>
			<button
				type="button"
				onclick={again}
				class="mt-3 cursor-pointer rounded-full border border-ink/16 px-[22px] py-[11px] text-[13px] font-medium transition-colors hover:bg-cream"
			>
				{m.sup_again()}
			</button>
		</div>
	{:else}
		<form class="flex flex-col gap-[22px]" onsubmit={submit}>
			<fieldset>
				<legend class={label}>{m.sup_amount()}</legend>
				<div class="grid grid-cols-3 gap-2">
					{#each SUPPORT_AMOUNTS as a (a)}
						<button
							type="button"
							aria-pressed={preset === a}
							onclick={() => {
								preset = a;
								error = false;
							}}
							class="cursor-pointer rounded-[14px] border px-1.5 py-3 text-center text-sm font-medium whitespace-nowrap transition-colors {preset ===
							a
								? chipOn
								: chipOff}"
						>
							{a === SUPPORT_CUSTOM ? m.sup_amount_other() : formatVnd(a, locale)}
						</button>
					{/each}
				</div>
				{#if preset === SUPPORT_CUSTOM}
					<label for="support-custom" class="sr-only">{m.sup_amount_placeholder()}</label>
					<input
						id="support-custom"
						value={custom}
						oninput={onCustomInput}
						inputmode="numeric"
						placeholder={m.sup_amount_placeholder()}
						class="mt-2.5 w-full rounded-[14px] border border-ink/14 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-gold"
					/>
				{/if}
			</fieldset>

			<fieldset>
				<legend class={label}>{m.sup_method()}</legend>
				<div class="flex flex-wrap gap-2">
					{#each SUPPORT_PAYMENTS as p, i (p.slug)}
						<button
							type="button"
							aria-pressed={payment === i}
							onclick={() => (payment = i)}
							class="cursor-pointer rounded-full border px-3.5 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors {payment ===
							i
								? chipOn
								: chipOff}"
						>
							{p.label()}
						</button>
					{/each}
				</div>
			</fieldset>

			<div>
				<label for="support-message" class="mb-1.5 block text-xs font-medium text-ink/55">
					{m.sup_message()}
				</label>
				<textarea
					id="support-message"
					bind:value={message}
					rows="2"
					placeholder={m.sup_message_placeholder()}
					class="w-full resize-y rounded-[14px] border border-ink/14 bg-white px-3.5 py-3 text-sm/normal text-ink outline-none focus:border-gold"
				></textarea>
			</div>

			<div class="flex items-center gap-3.5">
				<div class="flex-1">
					<p class="text-sm font-medium">{m.sup_anonymous()}</p>
					<p class="mt-0.5 text-xs text-ink/50">{m.sup_anonymous_hint()}</p>
				</div>
				<Toggle checked={anonymous} label={m.sup_anonymous()} onchange={(v) => (anonymous = v)} />
			</div>

			<div class="flex flex-col gap-2 border-t border-ink/7 pt-[18px]">
				<button
					type="submit"
					class="w-full cursor-pointer rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-[#3a332b]"
				>
					{amount > 0 ? m.sup_submit_amount({ amount: formatVnd(amount, locale) }) : m.sup_submit()}
				</button>
				{#if error}
					<p role="alert" class="text-center text-xs text-[#a4442e]">{m.sup_err_amount()}</p>
				{/if}
				<p class="text-center text-xs text-ink/50">{m.sup_once_note()}</p>
			</div>
		</form>
	{/if}
</div>
