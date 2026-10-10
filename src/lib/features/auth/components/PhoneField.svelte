<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { formatPhone, normalizePhone } from '$lib/utils/phone';
	import { COUNTRIES } from '../data';
	import CountryPicker from './CountryPicker.svelte';

	interface Props {
		id: string;
		phone?: string;
		valid?: boolean;
		/** Full international number ("+84949123456") when valid, else empty. For form posts. */
		e164?: string;
		/** Label rendered inside the box; omit when the parent renders its own. */
		label?: string;
		/** Show the helper line under the box. */
		hint?: boolean;
	}

	// `valid` is write-only here: it reports validity up to the parent via bind:.
	// eslint-disable-next-line no-useless-assignment
	let {
		id,
		phone = $bindable(''),
		valid = $bindable(),
		e164 = $bindable(''),
		label,
		hint = true
	}: Props = $props();

	let countryIdx = $state(0);
	let pickerOpen = $state(false);

	const country = $derived(COUNTRIES[countryIdx]);
	const digits = $derived(normalizePhone(phone, country.dial, country.len));
	const ok = $derived(digits.length === country.len);

	$effect(() => {
		valid = ok;
		e164 = ok ? country.dial + digits : '';
	});
</script>

<div>
	<div
		class="rounded-2xl border bg-paper px-4 py-3 {phone && !ok ? 'border-gold' : 'border-ink/12'}"
	>
		{#if label}
			<label for={id} class="text-[11px] text-ink/45">{label}</label>
		{/if}
		<div class="flex items-center gap-2.5 {label ? 'mt-1' : ''}">
			<button
				type="button"
				onclick={() => (pickerOpen = true)}
				class="flex flex-none cursor-pointer items-center gap-[7px] py-0.5 pr-0.5"
				aria-label={m.country_picker_title()}
			>
				<span
					class="rounded-[5px] bg-[#EFE6D5] px-[5px] py-0.5 text-[10px] font-semibold tracking-[.06em]"
					>{country.iso}</span
				>
				<span class="text-[15px]">{country.dial}</span>
				<span
					class="size-1.5 translate-y-[-2px] rotate-45 border-r-[1.4px] border-b-[1.4px] border-ink/45"
					aria-hidden="true"
				></span>
			</button>
			<span class="h-5 w-px flex-none bg-ink/12" aria-hidden="true"></span>
			<input
				{id}
				bind:value={phone}
				maxlength={16}
				type="tel"
				inputmode="tel"
				autocomplete="tel-national"
				placeholder={m.phone_placeholder()}
				aria-label={label ? undefined : m.phone_label()}
				class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35"
			/>
			<span
				class="flex size-[18px] flex-none items-center justify-center rounded-full bg-sage transition-opacity {ok
					? 'opacity-100'
					: 'opacity-0'}"
				aria-hidden="true"
			>
				<span
					class="mt-[-2px] h-1 w-[7px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-white"
				></span>
			</span>
		</div>
	</div>
	{#if hint}
		<p
			class="mt-1.5 ml-4 text-[11px] {ok ? 'text-sage' : phone ? 'text-gold-deep' : 'text-ink/50'}"
		>
			{#if ok}
				{m.phone_hint_ok({ dial: country.dial, number: formatPhone(digits) })}
			{:else}
				{m.phone_hint({ dial: country.dial })}
			{/if}
		</p>
	{/if}
</div>

{#if pickerOpen}
	<CountryPicker
		selected={countryIdx}
		onclose={() => (pickerOpen = false)}
		onselect={(i) => {
			countryIdx = i;
			pickerOpen = false;
		}}
	/>
{/if}
