<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { authErrorMessage, errorContext } from '../errors';

	interface Props {
		form?: { error?: string } | null;
		/** Why the visitor landed here, from the `reason` query. */
		notice?: 'session_ended' | 'password_changed' | null;
		/** Same-site page to open after sign-in. */
		redirectTo?: string | null;
	}

	let { form, notice, redirectTo }: Props = $props();

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let busy = $state(false);

	const canSubmit = $derived(!busy && email.trim() !== '' && password !== '');
	const href = (path: string) => resolve(localizeHref(path) as Pathname);
</script>

<form
	method="POST"
	use:enhance={() => {
		busy = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			busy = false;
			// Keep the email, drop the password after a failed attempt.
			if (result.type === 'failure') password = '';
		};
	}}
	class="flex w-[min(100%,400px)] flex-col"
>
	<span
		class="box-border flex size-14 items-end justify-center rounded-full border border-gold/45 bg-[radial-gradient(circle_at_50%_74%,rgba(217,150,60,.24),transparent_66%)] pb-[13px]"
		aria-hidden="true"
	>
		<span
			class="h-[17px] w-3 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-linear-to-b from-[#F3C673] to-[#D9963C] shadow-[0_0_18px_rgba(217,150,60,.8)]"
		></span>
	</span>
	<h1 class="mt-4 font-serif text-[40px]/[1.2]">{m.login_title()}</h1>
	<p class="mt-2 text-[13px] text-ink/52">{m.login_subtitle()}</p>

	{#if redirectTo}
		<input type="hidden" name="redirect" value={redirectTo} />
	{/if}
	{#if notice}
		<p
			class="mt-5 rounded-[14px] border border-gold/30 bg-gold/8 px-3.5 py-3 text-[13px]/[1.55] text-pretty text-ink/75"
			role="status"
		>
			{notice === 'session_ended' ? m.login_session_ended() : m.login_password_changed()}
		</p>
	{/if}

	<div class="mt-6 flex flex-col gap-2.5">
		<label class="rounded-2xl border border-ink/12 bg-paper px-4 py-3">
			<span class="block text-xs text-ink/45">{m.login_email_label()}</span>
			<input
				bind:value={email}
				name="email"
				type="email"
				inputmode="email"
				autocomplete="email"
				placeholder={m.login_email_placeholder()}
				class="mt-1 w-full min-w-0 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35"
			/>
		</label>
		<div class="rounded-2xl border border-ink/12 bg-paper px-4 py-3">
			<label for="login-password" class="block text-xs text-ink/45"
				>{m.login_password_label()}</label
			>
			<div class="mt-1 flex items-center gap-2.5">
				<input
					id="login-password"
					bind:value={password}
					name="password"
					type={showPassword ? 'text' : 'password'}
					autocomplete="current-password"
					placeholder={m.login_password_placeholder()}
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
	</div>
	<a href={href('/forgot-password')} class="mt-3 self-end text-[13px] font-medium text-gold-deep"
		>{m.login_forgot()}</a
	>

	{#if form?.error}
		<p
			class="mt-4 rounded-[14px] border border-[#A4442E]/18 bg-[#A4442E]/7 px-3.5 py-3 text-[13px]/[1.55] text-pretty text-[#A4442E]"
			role="alert"
		>
			{authErrorMessage(form.error, errorContext(form))}
		</p>
	{/if}

	<button
		type="submit"
		disabled={!canSubmit}
		class="mt-5 flex h-[54px] items-center justify-center rounded-full text-[15px] font-medium transition-colors {canSubmit
			? 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.18)] hover:bg-[#3A342C]'
			: 'cursor-not-allowed bg-ink/12 text-ink/38'}"
	>
		{#if busy}
			<span
				class="mr-2.5 size-[15px] animate-spin rounded-full border-2 border-[#F7F2E8]/35 border-t-[#F7F2E8]"
				aria-hidden="true"
			></span>
		{/if}
		{m.login_submit()}
	</button>
	<a
		href={href('/signup')}
		class="mt-2.5 flex h-[52px] items-center justify-center rounded-full border border-gold/50 bg-paper text-sm font-medium text-gold-deep hover:bg-[#FBF3E4]"
	>
		{m.login_create_account()}
	</a>
	<a href={href('/')} class="mt-3.5 text-center text-[13px] text-ink/45">{m.login_guest()}</a>
</form>
