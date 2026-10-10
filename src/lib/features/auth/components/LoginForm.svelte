<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { authErrorMessage } from '../errors';
	import PhoneField from './PhoneField.svelte';

	interface Props {
		form?: { error?: string } | null;
	}

	let { form }: Props = $props();

	let phone = $state('');
	let phoneOk = $state(false);
	let e164 = $state('');
	let password = $state('');
	let busy = $state(false);

	const href = (path: string) => resolve(localizeHref(path) as Pathname);
</script>

<form
	method="POST"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
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
	<h1 class="mt-4 font-serif text-[32px]/[1.2]">{m.login_title()}</h1>
	<p class="mt-2 text-[13.5px] text-ink/50">{m.login_subtitle()}</p>

	<label for="login-phone" class="mt-6 text-[11px] tracking-[.06em] text-ink/45 uppercase"
		>{m.login_phone_label()}</label
	>
	<div class="mt-2">
		<PhoneField id="login-phone" bind:phone bind:valid={phoneOk} bind:e164 />
		<input type="hidden" name="phone_number" value={e164} />
	</div>

	<div
		class="mt-3 flex items-center gap-2.5 rounded-2xl border border-ink/12 bg-paper px-4 py-[15px]"
	>
		<input
			bind:value={password}
			name="password"
			type="password"
			autocomplete="current-password"
			placeholder={m.login_password_placeholder()}
			aria-label={m.login_password_placeholder()}
			class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35"
		/>
		<a href={href('/forgot-password')} class="text-xs font-medium text-gold-deep"
			>{m.login_forgot()}</a
		>
	</div>

	{#if form?.error}
		<p class="mt-3 ml-1 text-xs text-[#9A5F58]" role="alert">{authErrorMessage(form.error)}</p>
	{/if}

	<button
		type="submit"
		disabled={busy || !phoneOk || !password}
		class="mt-5 h-[54px] rounded-full text-[15px] font-medium transition-colors {busy ||
		!phoneOk ||
		!password
			? 'cursor-not-allowed bg-ink/12 text-ink/38'
			: 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.18)] hover:bg-[#3A342C]'}"
	>
		{m.login_submit()}
	</button>
	<button
		type="button"
		class="mt-2.5 h-[52px] cursor-pointer rounded-full border border-ink/16 text-sm font-medium hover:bg-ink/4"
	>
		{m.login_otp()}
	</button>

	<div class="mt-7 flex items-center gap-3">
		<span class="h-px flex-1 bg-ink/12"></span>
		<span class="text-[11.5px] text-ink/38">{m.login_or()}</span>
		<span class="h-px flex-1 bg-ink/12"></span>
	</div>

	<a
		href={href('/signup')}
		class="mt-3.5 flex h-[52px] items-center justify-center rounded-full border border-gold/50 bg-paper text-[14.5px] font-medium text-gold-deep hover:bg-[#FBF3E4]"
	>
		{m.login_create_account()}
	</a>
	<a href={href('/')} class="mt-3.5 text-center text-[13px] text-ink/45">{m.login_guest()}</a>
</form>
