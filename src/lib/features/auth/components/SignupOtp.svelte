<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { authErrorMessage } from '../errors';

	interface Props {
		phone: string;
		resendAfter: number;
		error?: string;
		retryAfter?: number;
		onback: () => void;
	}

	let { phone, resendAfter, error, retryAfter, onback }: Props = $props();

	let code = $state('');
	let busy = $state(false);
	let left = $state(0);

	$effect(() => {
		left = resendAfter;
		const timer = setInterval(() => {
			if (left > 0) left -= 1;
		}, 1000);
		return () => clearInterval(timer);
	});

	$effect(() => {
		if (retryAfter) left = retryAfter;
	});
</script>

<div class="flex w-[min(100%,420px)] flex-col">
	<h1 class="font-serif text-[31px]/[1.22]">{m.signup_otp_title()}</h1>
	<p class="mt-2.5 text-[13.5px]/[1.65] text-ink/50">{m.signup_otp_subtitle({ phone })}</p>

	<form
		method="POST"
		action="?/verify"
		class="mt-[22px] flex flex-col"
		use:enhance={() => {
			busy = true;
			return async ({ update }) => {
				await update({ reset: false });
				busy = false;
			};
		}}
	>
		<input type="hidden" name="phone_number" value={phone} />
		<label
			class="rounded-2xl border bg-paper px-4 py-3 {error ? 'border-[#C2857F]' : 'border-ink/12'}"
		>
			<span class="text-[11px] text-ink/45">{m.signup_otp_label()}</span>
			<input
				bind:value={code}
				name="otp_code"
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength={6}
				pattern="[0-9]{6}"
				placeholder="······"
				class="mt-1 block w-full border-0 bg-transparent p-0 text-[22px] tracking-[.4em] text-ink outline-none placeholder:text-ink/25"
			/>
		</label>
		{#if error}
			<p class="mt-2 ml-1 text-xs text-[#9A5F58]" role="alert">{authErrorMessage(error)}</p>
		{/if}
		<button
			type="submit"
			disabled={busy || code.length !== 6}
			class="mt-5 h-[54px] w-full rounded-full text-[15px] font-medium transition-colors {!busy &&
			code.length === 6
				? 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.16)]'
				: 'cursor-not-allowed bg-ink/12 text-ink/38'}"
		>
			{m.signup_otp_submit()}
		</button>
	</form>

	<form
		method="POST"
		action="?/resend"
		use:enhance={() =>
			async ({ update, result }) => {
				await update({ reset: false });
				if (result.type === 'success') left = (result.data?.resendAfter as number) ?? 60;
			}}
	>
		<input type="hidden" name="phone_number" value={phone} />
		<button
			type="submit"
			disabled={left > 0}
			class="mt-3.5 w-full text-center text-[13px] {left > 0
				? 'text-ink/38'
				: 'cursor-pointer text-gold-deep'}"
		>
			{left > 0 ? m.signup_otp_resend_in({ seconds: left }) : m.signup_otp_resend()}
		</button>
	</form>
	<button
		type="button"
		onclick={onback}
		class="mt-2 cursor-pointer text-center text-[13px] text-ink/45"
	>
		{m.signup_otp_change_phone()}
	</button>
</div>
