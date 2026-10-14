<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { TempleSuggestionRequest } from '$lib/types/temple';
	import { COUNTRIES } from '../data';
	import { authErrorMessage } from '../errors';

	interface Props {
		/** E.164, e.g. "+84949123456". */
		phone: string;
		/** Seconds until the code may be resent (from the backend). */
		resendAfter?: number;
		/** Seconds the code stays valid (from the backend). */
		expiresIn?: number;
		error?: string;
		/** Proposed temple to submit after the account is created; round-trips untouched. */
		suggestion?: TempleSuggestionRequest | null;
		onback: () => void;
	}

	let { phone, resendAfter, expiresIn, error, suggestion, onback }: Props = $props();

	const LENGTH = 6;
	const DEFAULT_EXPIRES = 90;
	const DEFAULT_RESEND = 60;

	const suggestionJson = $derived(suggestion ? JSON.stringify(suggestion) : '');

	// "+84 949 ••• 456": enough to recognise the number without printing it in full.
	const masked = $derived.by(() => {
		const dial = COUNTRIES.find((c) => phone.startsWith(c.dial))?.dial;
		if (!dial) return phone;
		const national = phone.slice(dial.length);
		return `${dial} ${national.slice(0, 3)} ••• ${national.slice(-3)}`;
	});

	let code = $state('');
	let busy = $state(false);
	let input: HTMLInputElement | undefined = $state();
	let focused = $state(false);

	// Deadlines are wall-clock so a throttled background tab still counts down correctly.
	// Only the first values matter: later challenges are applied by the resend handler.
	let now = $state(Date.now());
	let expiresAt = $state(untrack(() => now + (expiresIn ?? DEFAULT_EXPIRES) * 1000));
	let resendAt = $state(untrack(() => now + (resendAfter ?? DEFAULT_RESEND) * 1000));
	let totalMs = $state(untrack(() => (expiresIn ?? DEFAULT_EXPIRES) * 1000));

	onMount(() => {
		input?.focus();
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const left = $derived(Math.max(0, Math.ceil((expiresAt - now) / 1000)));
	const wait = $derived(Math.max(0, Math.ceil((resendAt - now) / 1000)));
	const expired = $derived(left === 0);
	const ready = $derived(code.length === LENGTH && !expired && !busy);
	const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	const tone = $derived(expired ? '#A4442E' : left <= 20 ? '#B8862F' : '#4E6C59');
	const pct = $derived(Math.min(100, (left * 1000 * 100) / totalMs));

	function onInput() {
		code = code.replace(/\D/g, '').slice(0, LENGTH);
	}

	function boxBorder(i: number) {
		if (error) return '#C2857F';
		if (i === Math.min(code.length, LENGTH - 1) && focused && !expired) return '#B8862F';
		return code[i] ? 'rgba(34,30,25,.28)' : 'rgba(34,30,25,.12)';
	}
</script>

<div class="flex w-[min(100%,400px)] flex-col">
	<button
		type="button"
		onclick={onback}
		class="mb-[22px] flex cursor-pointer items-center gap-2 self-start text-[13px] font-medium text-ink/55 transition-colors hover:text-ink"
	>
		<span
			class="size-[7px] rotate-45 border-b-[1.5px] border-l-[1.5px] border-current"
			aria-hidden="true"
		></span>
		{m.signup_otp_back()}
	</button>

	<h1 class="font-serif text-[40px]/[1.2]">{m.signup_otp_title()}</h1>
	<p class="mt-2.5 text-[13px]/[1.65] text-pretty text-ink/55">
		{m.signup_otp_subtitle()}
		<span class="font-medium whitespace-nowrap text-ink">{masked}</span>.
		<button type="button" onclick={onback} class="cursor-pointer font-medium text-gold-deep">
			{m.signup_otp_change_phone()}
		</button>
	</p>

	<form
		method="POST"
		action="?/verify"
		class="flex flex-col"
		use:enhance={() => {
			busy = true;
			return async ({ update, result }) => {
				await update({ reset: false });
				busy = false;
				// A wrong code is useless on retry: start over with the cursor in the first box.
				if (result.type === 'failure') {
					code = '';
					input?.focus();
				}
			};
		}}
	>
		<input type="hidden" name="phone_number" value={phone} />
		<input type="hidden" name="temple_suggestion" value={suggestionJson} />

		<div class="relative mt-[26px]">
			<div class="grid grid-cols-6 gap-2" aria-hidden="true">
				{#each [0, 1, 2, 3, 4, 5] as i (i)}
					<div
						class="flex h-[58px] items-center justify-center rounded-[14px] border-[1.5px] bg-[#FFFDF8] text-2xl font-medium"
						style:border-color={boxBorder(i)}
						style:box-shadow={!error &&
						focused &&
						!expired &&
						i === Math.min(code.length, LENGTH - 1)
							? '0 0 0 3px rgba(184,134,47,.14)'
							: 'none'}
					>
						{code[i] ?? ''}
					</div>
				{/each}
			</div>
			<input
				bind:this={input}
				bind:value={code}
				oninput={onInput}
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
				name="otp_code"
				aria-label={m.signup_otp_label()}
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength={LENGTH}
				class="absolute inset-0 size-full cursor-text border-0 text-base opacity-0"
			/>
		</div>

		<div class="mt-3.5 flex items-center justify-between gap-3 text-[13px]">
			<span style:color={tone}>
				{expired ? m.signup_otp_expired() : m.signup_otp_expires_in({ time: clock(left) })}
			</span>
			<!-- Resend is its own form below; this slot only shows the countdown. -->
			{#if wait > 0}
				<span class="text-ink/45">{m.signup_otp_resend_in({ time: clock(wait) })}</span>
			{/if}
		</div>
		<div class="mt-2.5 h-[3px] overflow-hidden rounded-xs bg-ink/8" aria-hidden="true">
			<div
				class="h-full transition-[width] duration-1000 ease-linear"
				style:width="{pct}%"
				style:background={tone}
			></div>
		</div>

		{#if error}
			<p
				class="mt-3.5 rounded-xl bg-[#A4442E]/8 px-3.5 py-2.5 text-[13px] text-[#A4442E]"
				role="alert"
			>
				{authErrorMessage(error)}
			</p>
		{/if}

		<button
			type="submit"
			disabled={!ready}
			class="mt-5 h-[54px] w-full rounded-full bg-ink text-[15px] font-medium text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.18)] transition-colors {ready
				? 'cursor-pointer hover:bg-[#3A342C]'
				: 'cursor-not-allowed opacity-45'}"
		>
			{m.signup_otp_submit()}
		</button>
	</form>

	<form
		method="POST"
		action="?/resend"
		class="text-center"
		use:enhance={() =>
			async ({ update, result }) => {
				await update({ reset: false });
				const at = Date.now();
				if (result.type === 'success') {
					const data = result.data as { resendAfter?: number; expiresIn?: number } | undefined;
					totalMs = (data?.expiresIn ?? DEFAULT_EXPIRES) * 1000;
					expiresAt = at + totalMs;
					resendAt = at + (data?.resendAfter ?? DEFAULT_RESEND) * 1000;
					code = '';
					input?.focus();
				} else if (result.type === 'failure') {
					// `OTP_RESEND_TOO_SOON` carries the remaining wait.
					const retry = (result.data as { retryAfter?: number } | undefined)?.retryAfter;
					if (retry) resendAt = at + retry * 1000;
				}
			}}
	>
		<input type="hidden" name="phone_number" value={phone} />
		<input type="hidden" name="temple_suggestion" value={suggestionJson} />
		{#if wait === 0}
			<button type="submit" class="mt-3.5 cursor-pointer text-[13px] font-medium text-gold-deep">
				{m.signup_otp_resend()}
			</button>
		{/if}
	</form>
</div>
