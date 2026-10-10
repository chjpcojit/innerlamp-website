<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { passwordScore } from '$lib/utils/password';
	import { enhance } from '$app/forms';
	import { DHARMA_NAMES, TEMPLES } from '../data';
	import { authErrorMessage } from '../errors';
	import PhoneField from './PhoneField.svelte';
	import SignupOtp from './SignupOtp.svelte';

	interface Props {
		form?: {
			error?: string;
			retryAfter?: number;
			step?: 'otp';
			phone?: string;
			resendAfter?: number;
		} | null;
	}

	let { form }: Props = $props();

	// Step 2 (SMS code) shows once the backend has accepted step 1; "change number" returns.
	let backed = $state(false);
	let busy = $state(false);
	const otpStep = $derived(form?.step === 'otp' && !!form.phone && !backed);

	let name = $state('');
	let nameIdx = $state(-1);
	let diceRot = $state(0);
	let templeIdx = $state(-1);
	let templeOpen = $state(false);
	let phone = $state('');
	let phoneOk = $state(false);
	let e164 = $state('');
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let agree = $state(false);

	const emailOk = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
	const emailErr = $derived(!!email && !emailOk);
	const score = $derived(passwordScore(password));
	// The backend counts bytes, not characters.
	const passwordOk = $derived(new TextEncoder().encode(password).length >= 8);
	const canSubmit = $derived(agree && phoneOk && emailOk && passwordOk && !busy);
	// "none" / "other" carry no place name to store.
	const ordinationPlace = $derived(
		templeIdx > 0 && TEMPLES[templeIdx].id !== 'other' ? TEMPLES[templeIdx].label() : ''
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

	const href = (path: string) => resolve(localizeHref(path) as Pathname);

	const field = 'rounded-2xl border bg-paper px-4 py-3';
	const label = 'text-[11px] text-ink/45';
	const input =
		'min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35';
	const check =
		'size-[18px] flex-none rounded-full bg-sage flex items-center justify-center transition-opacity';
</script>

{#if otpStep && form?.phone}
	<SignupOtp
		phone={form.phone}
		resendAfter={form.resendAfter ?? 60}
		error={form.error}
		retryAfter={form.retryAfter}
		onback={() => (backed = true)}
	/>
{:else}
	<form
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
		<input type="hidden" name="phone_number" value={e164} />
		<input type="hidden" name="ordination_place" value={ordinationPlace} />
		<h1 class="font-serif text-[31px]/[1.22]">{m.signup_title()}</h1>
		<p class="mt-2.5 text-[13.5px]/[1.65] text-ink/50">{m.signup_subtitle()}</p>

		<div class="mt-[22px] flex flex-col gap-2.5">
			<!-- Name -->
			<div class="{field} flex items-center gap-3 border-ink/12">
				<label class="flex min-w-0 flex-1 flex-col">
					<span class={label}>{m.signup_name_label()}</span>
					<input
						bind:value={name}
						name="dharma_name"
						autocomplete="nickname"
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

			<!-- Temple -->
			<div class="relative z-20">
				<button
					type="button"
					aria-expanded={templeOpen}
					onclick={() => (templeOpen = !templeOpen)}
					class="{field} flex w-full cursor-pointer items-center gap-3 text-left select-none {templeOpen
						? 'border-gold/55'
						: 'border-ink/12'}"
				>
					<span class="min-w-0 flex-1">
						<span class="flex items-baseline justify-between gap-2">
							<span class={label}>{m.signup_temple_label()}</span>
							<span class="text-[10.5px] text-ink/38">{m.signup_temple_optional()}</span>
						</span>
						<span class="mt-[3px] block text-[15px] {templeIdx < 0 ? 'text-ink/42' : ''}">
							{templeIdx < 0 ? m.signup_temple_placeholder() : TEMPLES[templeIdx].label()}
						</span>
					</span>
					<span
						class="size-[7px] flex-none border-r-[1.5px] border-b-[1.5px] border-ink/45 transition-transform duration-200 {templeOpen
							? 'translate-x-[-2px] translate-y-[-2px] rotate-[225deg]'
							: 'translate-x-[-2px] translate-y-[-2px] rotate-45'}"
						aria-hidden="true"
					></span>
				</button>
				{#if templeOpen}
					<ul
						class="absolute inset-x-0 top-[calc(100%+6px)] max-h-[300px] overflow-y-auto rounded-2xl border border-ink/12 bg-paper shadow-[0_16px_40px_rgba(34,30,25,.16)]"
					>
						{#each TEMPLES as t, i (t.id)}
							<li class={i ? 'border-t border-ink/7' : ''}>
								<button
									type="button"
									onclick={() => {
										templeIdx = i;
										templeOpen = false;
									}}
									class="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left hover:bg-ink/4 {i ===
									templeIdx
										? 'bg-gold/8'
										: ''}"
								>
									<span class="min-w-0 flex-1">
										<span class="block text-sm">{t.label()}</span>
										<span class="mt-0.5 block text-[11px] text-ink/45">{t.sub()}</span>
									</span>
									<span
										class="box-border flex size-4 flex-none items-center justify-center rounded-full border-[1.5px] {i ===
										templeIdx
											? 'border-gold'
											: 'border-ink/18'}"
									>
										<span class="size-[7px] rounded-full {i === templeIdx ? 'bg-gold' : ''}"></span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<PhoneField
				id="signup-phone"
				bind:phone
				bind:valid={phoneOk}
				bind:e164
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
				<a href={href('/terms')} class="underline">{m.signup_terms_link()}</a>
				{m.signup_agree_and()}
				<a href={href('/privacy')} class="underline">{m.signup_privacy_link()}</a>
				{m.signup_agree_suffix()}
			</span>
		</label>

		<div class="mt-[18px] border-t border-ink/8 pt-4">
			{#if form?.error && !form.step}
				<p class="mb-3 ml-1 text-xs text-[#9A5F58]" role="alert">{authErrorMessage(form.error)}</p>
			{/if}
			<button
				type="submit"
				disabled={!canSubmit}
				class="h-[54px] w-full rounded-full text-[15px] font-medium transition-colors {canSubmit
					? 'cursor-pointer bg-ink text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.16)]'
					: 'cursor-not-allowed bg-ink/12 text-ink/38'}"
			>
				{m.signup_submit()}
			</button>
			<a href={href('/login')} class="mt-3.5 block text-center text-[13px] text-ink/45"
				>{m.signup_have_account()}</a
			>
		</div>
	</form>
{/if}
