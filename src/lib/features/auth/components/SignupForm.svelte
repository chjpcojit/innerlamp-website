<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { passwordScore } from '$lib/utils/password';
	import { enhance } from '$app/forms';
	import { DHARMA_NAMES } from '../data';
	import { authErrorMessage, errorContext } from '../errors';
	import { checkPassword } from '../validation';
	import PhoneField from './PhoneField.svelte';
	import SignupOtp from './SignupOtp.svelte';
	import LegalModal from '$lib/components/sections/LegalModal.svelte';
	import type { LegalKind } from '$lib/content/legal';
	import AddTempleForm from './AddTempleForm.svelte';
	import TempleSelect from '$lib/components/ui/TempleSelect.svelte';
	import type { PendingTemple, TempleOption, TempleSuggestionRequest } from '$lib/types/temple';

	type TempleSuggestion = TempleSuggestionRequest;

	interface Props {
		form?: {
			error?: string;
			step?: 'otp';
			email?: string;
			resendAfter?: number;
			expiresIn?: number;
			suggestion?: TempleSuggestion | null;
		} | null;
	}

	let { form }: Props = $props();

	// Step 2 (emailed code) shows once the backend has accepted step 1; "change email" returns.
	let backed = $state(false);
	let busy = $state(false);
	const otpStep = $derived(form?.step === 'otp' && !!form.email && !backed);

	let fullName = $state('');
	let name = $state('');
	let nameIdx = $state(-1);
	let diceRot = $state(0);
	let temple = $state<TempleOption | null>(null);
	// A temple the visitor proposed because theirs wasn't listed; awaits InnerLamp's review.
	let pendingTemple = $state<PendingTemple | null>(null);
	// The "add temple" step replaces the form's view but keeps everything typed so far.
	let addingTemple = $state(false);
	let phone = $state('');
	let phoneOk = $state(false);
	let national = $state('');
	let iso = $state('');
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let agree = $state(false);

	const emailOk = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
	const emailErr = $derived(!!email && !emailOk);
	const score = $derived(passwordScore(password));
	// 8–64 characters after NFC (BR-ONB-06).
	const passwordOk = $derived(checkPassword(password) === 'ok');
	const canSubmit = $derived(
		fullName.trim().length >= 2 && agree && phoneOk && emailOk && passwordOk && !busy
	);
	const strengthLabels = [
		() => m.signup_strength_min(),
		() => m.signup_strength_weak(),
		() => m.signup_strength_fair(),
		() => m.signup_strength_good(),
		() => m.signup_strength_strong()
	];
	const strengthColor = $derived(score <= 1 ? '#C2857F' : score === 2 ? '#D9963C' : '#6E8F7A');
	const strengthText = $derived(
		score >= 3 ? 'text-sage' : score === 2 ? 'text-gold-deep' : 'text-[#9A5F58]'
	);

	function suggestName() {
		nameIdx = (nameIdx + 1) % DHARMA_NAMES.length;
		name = DHARMA_NAMES[nameIdx]();
		diceRot += 180;
	}

	/** Terms/privacy popup, so the sign-up form is never left. / Popup điều khoản, không rời form đăng ký. */
	let legal = $state<LegalKind | null>(null);
	function openLegal(e: MouseEvent, kind: LegalKind) {
		// Keep the label from toggling the checkbox; href stays as the no-JS fallback. / Không để label tick checkbox; href giữ cho no-JS.
		e.preventDefault();
		legal = kind;
	}

	const href = (path: string) => resolve(localizeHref(path) as Pathname);

	const field = 'rounded-2xl border bg-paper px-4 py-3';
	const label = 'text-xs text-ink/45';
	const input =
		'min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35';
	const check =
		'size-[18px] flex-none rounded-full bg-sage flex items-center justify-center transition-opacity';
</script>

{#if otpStep && form?.email}
	<SignupOtp
		email={form.email}
		resendAfter={form.resendAfter}
		expiresIn={form.expiresIn}
		suggestion={form.suggestion}
		error={form.error}
		errorContext={errorContext(form)}
		onback={() => (backed = true)}
	/>
{:else}
	{#if addingTemple}
		<AddTempleForm
			initial={pendingTemple}
			onback={() => (addingTemple = false)}
			onnone={() => {
				temple = null;
				pendingTemple = null;
				addingTemple = false;
			}}
			onsubmit={(t) => {
				pendingTemple = t;
				temple = null;
				addingTemple = false;
			}}
		/>
	{/if}
	<form
		hidden={addingTemple}
		method="POST"
		action="?/request"
		class="flex w-[min(100%,420px)] flex-col"
		use:enhance={() => {
			busy = true;
			backed = false;
			return async ({ update }) => {
				await update({ reset: false });
				busy = false;
			};
		}}
	>
		<input type="hidden" name="phone_number" value={national} />
		<input type="hidden" name="phone_country" value={iso} />
		{#if pendingTemple?.ward_code}
			<!-- Sent to the backend for review once the account is created. -->
			<input type="hidden" name="suggest_name" value={pendingTemple.name} />
			<input type="hidden" name="suggest_province_code" value={pendingTemple.province_code} />
			<input type="hidden" name="suggest_ward_code" value={pendingTemple.ward_code} />
			<input type="hidden" name="suggest_address" value={pendingTemple.address} />
		{/if}
		<h1 class="font-serif text-[40px]/[1.22]">{m.signup_title()}</h1>
		<p class="mt-2.5 text-[13px]/[1.65] text-ink/52">{m.signup_subtitle()}</p>

		<div class="mt-[22px] flex flex-col gap-2.5">
			<!-- Full name -->
			<div class="{field} border-ink/12">
				<label class="flex flex-col">
					<span class="{label} flex items-baseline gap-1">
						{m.signup_fullname_label()}<span class="text-[#A7443F]" aria-hidden="true">*</span>
					</span>
					<input
						bind:value={fullName}
						name="full_name"
						autocomplete="name"
						maxlength={300}
						required
						placeholder={m.signup_fullname_placeholder()}
						class="{input} mt-[3px]"
					/>
				</label>
			</div>

			<!-- Dharma name -->
			<div class="{field} flex items-center gap-3 border-ink/12">
				<label class="flex min-w-0 flex-1 flex-col">
					<span class="flex items-baseline gap-2">
						<span class={label}>{m.signup_name_label()}</span>
						<span class="text-[10.5px] text-ink/38">{m.signup_name_optional()}</span>
					</span>
					<input
						bind:value={name}
						name="dharma_name"
						autocomplete="nickname"
						maxlength={255}
						placeholder={m.signup_name_placeholder()}
						class="{input} mt-[3px]"
					/>
				</label>
				<button
					type="button"
					onclick={suggestName}
					class="flex h-[34px] flex-none cursor-pointer items-center gap-1.5 rounded-full border border-gold/30 bg-gold/14 px-[13px] transition-colors select-none hover:bg-gold/24"
				>
					<span
						class="box-border size-[13px] rounded-full border-[1.5px] border-gold-deep border-t-transparent transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.3,1)]"
						style:transform="rotate({diceRot}deg)"
						aria-hidden="true"
					></span>
					<span class="text-xs font-medium whitespace-nowrap text-gold-deep"
						>{m.signup_name_suggest()}</span
					>
				</button>
			</div>

			<TempleSelect
				bind:value={temple}
				bind:pending={pendingTemple}
				onadd={() => (addingTemple = true)}
			/>
			{#if pendingTemple}
				<div
					class="flex items-start gap-3 rounded-[14px] border border-gold/25 bg-gold/9 px-3.5 py-3"
					role="status"
				>
					<span
						class="mt-px flex size-[18px] flex-none items-center justify-center rounded-full bg-gold text-[11px] leading-none font-semibold text-paper"
						aria-hidden="true">!</span
					>
					<ul class="flex min-w-0 flex-col gap-1 text-[12.5px]/[1.6] text-pretty text-[#6E4A14]">
						<li>
							<span class="font-semibold"
								>{m.signup_temple_pending_review({ name: pendingTemple.name })}</span
							>
						</li>
						<li>{m.signup_temple_pending_no_place()}</li>
						<li>{m.signup_temple_pending_later()}</li>
					</ul>
				</div>
			{/if}

			<PhoneField
				id="signup-phone"
				bind:phone
				bind:valid={phoneOk}
				bind:national
				bind:iso
				label={m.phone_label()}
			/>

			<!-- Email -->
			<div class="{field} {emailErr ? 'border-[#C2857F]' : 'border-ink/12'}">
				<div class="flex items-baseline justify-between gap-2">
					<label for="signup-email" class={label}>{m.signup_email_label()}</label>
					<span class="text-[10.5px] text-ink/38">{m.signup_email_note()}</span>
				</div>
				<div class="mt-1 flex items-center gap-2.5">
					<input
						id="signup-email"
						bind:value={email}
						name="email"
						type="email"
						inputmode="email"
						autocomplete="email"
						placeholder={m.signup_email_placeholder()}
						class={input}
					/>
					<span class="{check} {emailOk ? 'opacity-100' : 'opacity-0'}" aria-hidden="true">
						<span
							class="mt-[-2px] h-1 w-[7px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-white"
						></span>
					</span>
				</div>
			</div>

			<!-- Password -->
			<div class="{field} {password ? 'border-gold/55' : 'border-ink/12'}">
				<label for="signup-password" class={label}>{m.signup_password_label()}</label>
				<div class="mt-[5px] flex items-center gap-2.5">
					<input
						id="signup-password"
						bind:value={password}
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="new-password"
						placeholder={m.signup_password_placeholder()}
						class={input}
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="cursor-pointer text-xs font-medium text-gold-deep select-none"
					>
						{showPassword ? m.signup_password_hide() : m.signup_password_show()}
					</button>
				</div>
			</div>
			<div class="flex items-center gap-1.5" aria-live="polite">
				{#each [0, 1, 2] as i (i)}
					<span
						class="h-[3px] flex-1 rounded-xs"
						style:background={i < Math.min(3, score) ? strengthColor : 'rgba(34,30,25,.12)'}
					></span>
				{/each}
				<span class="ml-1.5 min-w-16 text-[11px] {strengthText}">
					{password ? strengthLabels[score]() : ''}
				</span>
			</div>
		</div>

		<label class="mt-5 flex cursor-pointer gap-[11px] select-none">
			<input type="checkbox" bind:checked={agree} class="peer sr-only" />
			<span
				class="box-border flex size-5 flex-none items-center justify-center rounded-md border border-ink/30 bg-paper peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold {agree
					? ''
					: ''}"
				aria-hidden="true"
			>
				<span
					class="mt-[-2px] h-[4.5px] w-2 -rotate-45 border-b-[1.6px] border-l-[1.6px] border-[#F7F2E8] {agree
						? 'opacity-100'
						: 'opacity-0'}"
				></span>
			</span>
			<span class="text-xs/[1.6] text-pretty text-ink/60">
				{m.signup_agree_prefix()}
				<a href={href('/terms')} onclick={(e) => openLegal(e, 'terms')} class="underline"
					>{m.signup_terms_link()}</a
				>
				{m.signup_agree_and()}
				<a href={href('/privacy')} onclick={(e) => openLegal(e, 'privacy')} class="underline"
					>{m.signup_privacy_link()}</a
				>
				{m.signup_agree_suffix()}
			</span>
		</label>

		<div class="mt-[18px] border-t border-ink/8 pt-4">
			{#if form?.error && !form.step}
				<p
					class="mb-4 rounded-[14px] border border-[#A4442E]/18 bg-[#A4442E]/7 px-3.5 py-3 text-[13px]/[1.55] text-pretty text-[#A4442E]"
					role="alert"
				>
					{authErrorMessage(form.error, errorContext(form))}
					{#if form.error === 'PHONE_TAKEN'}
						<a href={href('/login')} class="font-medium underline">{m.login_submit()}</a>
					{/if}
				</p>
			{/if}
			<button
				type="submit"
				disabled={!canSubmit}
				class="flex h-[54px] w-full items-center justify-center rounded-full text-[15px] font-medium transition-colors {canSubmit
					? 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.16)]'
					: 'cursor-not-allowed bg-ink/12 text-ink/38'}"
			>
				{#if busy}
					<span
						class="mr-2.5 size-[15px] animate-spin rounded-full border-2 border-[#F7F2E8]/35 border-t-[#F7F2E8]"
						aria-hidden="true"
					></span>
				{/if}
				{m.signup_submit()}
			</button>
			<a href={href('/login')} class="mt-3.5 block text-center text-[13px] text-ink/45"
				>{m.signup_have_account()}</a
			>
		</div>
	</form>
	<LegalModal bind:kind={legal} />
{/if}
