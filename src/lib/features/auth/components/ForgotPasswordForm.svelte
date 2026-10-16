<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { authErrorMessage, errorContext } from '../errors';
	import { OtpTimers, clock } from '../otp-timers.svelte';
	import { checkPassword } from '../validation';

	interface Props {
		form?: {
			error?: string;
			step?: 'reset';
			email?: string;
			resendAfter?: number;
			expiresIn?: number;
		} | null;
	}

	let { form }: Props = $props();

	const LENGTH = 6;
	const DEFAULT_EXPIRES = 600;
	const DEFAULT_RESEND = 60;

	let email = $state('');
	let code = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let busy = $state(false);
	// "Change email" returns to step 1 without losing what was typed.
	let backed = $state(false);

	const resetStep = $derived(form?.step === 'reset' && !!form.email && !backed);
	const timers = new OtpTimers(
		untrack(() => form?.expiresIn ?? DEFAULT_EXPIRES),
		untrack(() => form?.resendAfter ?? DEFAULT_RESEND)
	);

	onMount(() => timers.start());

	const canSend = $derived(!busy && email.trim() !== '');
	const canReset = $derived(
		!busy && code.length === LENGTH && checkPassword(password) === 'ok' && !timers.expired
	);
	const href = (path: string) => resolve(localizeHref(path) as Pathname);

	function onCodeInput() {
		code = code.replace(/\D/g, '').slice(0, LENGTH);
	}

	const field = 'rounded-2xl border border-ink/12 bg-paper px-4 py-3';
	const inputClass =
		'mt-1 w-full min-w-0 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35';
	const primary = (on: boolean) =>
		`mt-5 flex h-[54px] items-center justify-center rounded-full text-[15px] font-medium transition-colors ${
			on
				? 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.18)] hover:bg-[#3A342C]'
				: 'cursor-not-allowed bg-ink/12 text-ink/38'
		}`;
</script>

{#snippet errorBox()}
	{#if form?.error}
		<p
			class="mt-4 rounded-[14px] border border-[#A4442E]/18 bg-[#A4442E]/7 px-3.5 py-3 text-[13px]/[1.55] text-pretty text-[#A4442E]"
			role="alert"
		>
			{authErrorMessage(form.error, errorContext(form))}
		</p>
	{/if}
{/snippet}

<div class="flex w-[min(100%,400px)] flex-col">
	{#if resetStep && form?.email}
		<button
			type="button"
			onclick={() => (backed = true)}
			class="mb-[22px] flex cursor-pointer items-center gap-2 self-start text-[13px] font-medium text-ink/55 transition-colors hover:text-ink"
		>
			<span
				class="size-[7px] rotate-45 border-b-[1.5px] border-l-[1.5px] border-current"
				aria-hidden="true"
			></span>
			{m.signup_otp_back()}
		</button>
		<h1 class="font-serif text-[40px]/[1.2]">{m.forgot_reset_title()}</h1>
		<p class="mt-2.5 text-[13px]/[1.65] text-pretty text-ink/55">
			{m.forgot_sent()}
			<span class="font-medium [word-break:break-all] text-ink">{form.email}</span>.
		</p>

		<form
			method="POST"
			action="?/confirm"
			class="flex flex-col"
			use:enhance={() => {
				busy = true;
				return async ({ update, result }) => {
					await update({ reset: false });
					busy = false;
					if (result.type === 'failure') password = '';
				};
			}}
		>
			<input type="hidden" name="email" value={form.email} />
			<label class="{field} mt-6">
				<span class="block text-xs text-ink/45">{m.forgot_code_label()}</span>
				<input
					bind:value={code}
					oninput={onCodeInput}
					name="otp_code"
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength={LENGTH}
					class="{inputClass} tracking-[.4em]"
				/>
			</label>
			<div class="{field} mt-2.5">
				<label for="forgot-new-password" class="block text-xs text-ink/45"
					>{m.forgot_new_password_label()}</label
				>
				<div class="mt-1 flex items-center gap-2.5">
					<input
						id="forgot-new-password"
						bind:value={password}
						name="new_password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="new-password"
						class="w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="cursor-pointer text-xs font-medium text-gold-deep select-none"
					>
						{showPassword ? m.login_password_hide() : m.login_password_show()}
					</button>
				</div>
			</div>
			<p class="mt-2 text-xs text-ink/45">{m.forgot_new_password_hint()}</p>

			<div class="mt-3.5 flex items-center justify-between gap-3 text-[13px]">
				<span class={timers.expired ? 'text-[#A4442E]' : 'text-sage'}>
					{timers.expired
						? m.signup_otp_expired()
						: m.signup_otp_expires_in({ time: clock(timers.left) })}
				</span>
				{#if timers.wait > 0}
					<span class="text-ink/45">{m.signup_otp_resend_in({ time: clock(timers.wait) })}</span>
				{/if}
			</div>

			{@render errorBox()}

			<button type="submit" disabled={!canReset} class={primary(canReset)}>
				{m.forgot_submit()}
			</button>
		</form>

		<form
			method="POST"
			action="?/resend"
			class="text-center"
			use:enhance={() =>
				async ({ update, result }) => {
					await update({ reset: false });
					if (result.type === 'success') {
						const data = result.data as { resendAfter?: number; expiresIn?: number } | undefined;
						timers.reset(data?.expiresIn ?? DEFAULT_EXPIRES, data?.resendAfter ?? DEFAULT_RESEND);
						code = '';
					} else if (result.type === 'failure') {
						const retry = (result.data as { retryAfter?: number } | undefined)?.retryAfter;
						if (retry) timers.delayResend(retry);
					}
				}}
		>
			<input type="hidden" name="email" value={form.email} />
			{#if timers.wait === 0}
				<button type="submit" class="mt-3.5 cursor-pointer text-[13px] font-medium text-gold-deep">
					{m.signup_otp_resend()}
				</button>
			{/if}
		</form>
	{:else}
		<form
			method="POST"
			action="?/request"
			class="flex flex-col"
			use:enhance={() => {
				busy = true;
				return async ({ update, result }) => {
					await update({ reset: false });
					busy = false;
					if (result.type === 'success') {
						const data = result.data as { resendAfter?: number; expiresIn?: number } | undefined;
						timers.reset(data?.expiresIn ?? DEFAULT_EXPIRES, data?.resendAfter ?? DEFAULT_RESEND);
						code = '';
						backed = false;
					}
				};
			}}
		>
			<h1 class="font-serif text-[40px]/[1.2]">{m.forgot_title()}</h1>
			<p class="mt-2 text-[13px]/[1.65] text-pretty text-ink/52">{m.forgot_subtitle()}</p>

			<label class="{field} mt-6">
				<span class="block text-xs text-ink/45">{m.login_email_label()}</span>
				<input
					bind:value={email}
					name="email"
					type="email"
					inputmode="email"
					autocomplete="email"
					placeholder={m.login_email_placeholder()}
					class={inputClass}
				/>
			</label>

			{@render errorBox()}

			<button type="submit" disabled={!canSend} class={primary(canSend)}>
				{m.forgot_send()}
			</button>
			<a href={href('/login')} class="mt-3.5 text-center text-[13px] text-ink/45"
				>{m.forgot_back_login()}</a
			>
		</form>
	{/if}
</div>
