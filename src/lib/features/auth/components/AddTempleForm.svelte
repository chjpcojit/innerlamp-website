<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SearchSelect, { type SearchOption } from '$lib/components/ui/SearchSelect.svelte';
	import type { NewWard, Province } from '$lib/types/administrative-unit';
	import type { PendingTemple } from '$lib/types/temple';
	import { fetchProvinces, fetchWards, unitType } from '../administrative-units';
	import { normalizeTempleName } from '../temple-name';

	interface Props {
		/** Previously submitted proposal, to pre-fill when the visitor comes back to edit it. */
		initial?: PendingTemple | null;
		onsubmit: (temple: PendingTemple) => void;
		/** Back to the sign-up form, keeping whatever was chosen there. */
		onback: () => void;
		/** "I have no place of ordination": clears the choice and goes back. */
		onnone: () => void;
	}

	let { initial = null, onsubmit, onback, onnone }: Props = $props();

	type Status = 'loading' | 'ready' | 'failed';

	// Only the first value matters: the form owns its fields from then on.
	const seed = untrack(() => initial);

	let name = $state(seed?.name ?? '');
	let address = $state(seed?.address ?? '');
	let provinceCode = $state<string | null>(seed?.province_code ?? null);
	let wardCode = $state<string | null>(seed?.ward_code ?? null);
	// Typed ward name, used only when the ward list could not be loaded.
	let wardText = $state(seed && !seed.ward_code ? seed.ward : '');
	let error = $state('');

	let provinces = $state<Province[]>([]);
	let provincesStatus = $state<Status>('loading');
	let wards = $state<NewWard[]>([]);
	let wardsStatus = $state<Status>(seed?.province_code ? 'loading' : 'ready');
	// Ignores a ward response that arrives after the visitor picked another province.
	let wardsRequest = 0;

	const provinceOptions = $derived<SearchOption[]>(
		provinces.map((p) => ({ value: p.code, label: p.name, sub: unitType(p) }))
	);
	const wardOptions = $derived<SearchOption[]>(
		wards.map((w) => ({ value: w.code, label: w.name, sub: unitType(w) }))
	);
	const province = $derived(provinces.find((p) => p.code === provinceCode));
	const ward = $derived(wards.find((w) => w.code === wardCode));
	// The list can't help (failed or empty): fall back to a plain text field.
	const wardFree = $derived(!!provinceCode && wardsStatus !== 'loading' && !wardOptions.length);

	async function loadProvinces() {
		provincesStatus = 'loading';
		try {
			provinces = await fetchProvinces();
			provincesStatus = 'ready';
		} catch {
			provincesStatus = 'failed';
		}
	}

	async function loadWards(code: string) {
		const request = ++wardsRequest;
		wardsStatus = 'loading';
		wards = [];
		try {
			const list = await fetchWards(code);
			if (request !== wardsRequest) return;
			wards = list;
			wardsStatus = 'ready';
		} catch {
			if (request !== wardsRequest) return;
			wardsStatus = 'failed';
		}
	}

	function pickProvince(code: string) {
		if (code === provinceCode) return;
		provinceCode = code;
		wardCode = null;
		wardText = '';
		error = '';
		loadWards(code);
	}

	onMount(() => {
		loadProvinces();
		// Re-opened with an earlier proposal: restore its ward list too.
		if (provinceCode) loadWards(provinceCode);
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const wardName = ward?.full_name ?? wardText.trim();
		if (name.trim().length < 3) return (error = m.add_temple_err_name());
		if (!province) return (error = m.add_temple_err_province());
		if (wardName.length < 2) return (error = m.add_temple_err_ward());
		if (address.trim().length < 2) return (error = m.add_temple_err_address());
		error = '';
		onsubmit({
			name: normalizeTempleName(name),
			province_code: province.code,
			province: province.full_name,
			ward_code: ward?.code ?? null,
			ward: wardName,
			address: address.trim()
		});
	}

	const field = 'rounded-2xl border border-ink/12 bg-paper px-4 py-3';
	const label = 'text-[11px] text-ink/45';
	const input =
		'mt-1 w-full border-0 bg-transparent p-0 text-[15px] text-ink outline-none placeholder:text-ink/35';
</script>

<form class="flex w-[min(100%,420px)] flex-col" onsubmit={submit} novalidate>
	<button
		type="button"
		onclick={onback}
		class="mb-[22px] flex cursor-pointer items-center gap-2 self-start text-[13px] font-medium text-ink/55 hover:text-ink"
	>
		<span
			class="size-[7px] rotate-45 border-b-[1.5px] border-l-[1.5px] border-current"
			aria-hidden="true"
		></span>
		{m.add_temple_back()}
	</button>

	<Icon kind="temple" size={44} />
	<h1 class="mt-3.5 font-serif text-[31px]/[1.22]">{m.add_temple_title()}</h1>
	<p class="mt-2.5 text-[13.5px]/[1.65] text-pretty text-ink/50">{m.add_temple_intro()}</p>

	<div class="mt-[22px] flex flex-col gap-2.5">
		<label class="{field} block">
			<span class={label}>{m.add_temple_name_label()}</span>
			<input
				bind:value={name}
				oninput={() => (error = '')}
				name="temple_name"
				autocomplete="off"
				maxlength={120}
				placeholder={m.add_temple_name_placeholder()}
				class={input}
			/>
		</label>

		<SearchSelect
			label={m.add_temple_province_label()}
			note={provincesStatus === 'ready'
				? m.add_temple_province_count({ count: provinces.length })
				: ''}
			placeholder={m.add_temple_province_placeholder()}
			searchPlaceholder={m.add_temple_province_search()}
			options={provinceOptions}
			value={provinceCode}
			loading={provincesStatus === 'loading'}
			failed={provincesStatus === 'failed'}
			onselect={pickProvince}
			onretry={loadProvinces}
		/>

		{#if wardFree}
			<label class="{field} block">
				<span class={label}>{m.add_temple_ward_label()}</span>
				<input
					bind:value={wardText}
					oninput={() => (error = '')}
					name="temple_ward"
					autocomplete="off"
					maxlength={120}
					placeholder={m.add_temple_ward_free_placeholder()}
					class={input}
				/>
			</label>
		{:else}
			<SearchSelect
				label={m.add_temple_ward_label()}
				note={wardsStatus === 'ready' && wardOptions.length
					? m.add_temple_ward_count({ count: wardOptions.length })
					: ''}
				placeholder={provinceCode
					? m.add_temple_ward_placeholder()
					: m.add_temple_ward_need_province()}
				searchPlaceholder={m.add_temple_ward_search()}
				options={wardOptions}
				value={wardCode}
				disabled={!provinceCode}
				loading={wardsStatus === 'loading'}
				onselect={(code) => {
					wardCode = code;
					error = '';
				}}
			/>
		{/if}

		<label class="{field} block">
			<span class="flex items-baseline justify-between gap-2">
				<span class={label}>{m.add_temple_address_label()}</span>
			</span>
			<input
				bind:value={address}
				name="temple_address"
				autocomplete="off"
				maxlength={500}
				placeholder={m.add_temple_address_placeholder()}
				class={input}
			/>
		</label>
	</div>

	{#if error}
		<p
			class="mt-3.5 rounded-xl bg-[#A4442E]/8 px-3.5 py-2.5 text-[13px] text-[#A4442E]"
			role="alert"
		>
			{error}
		</p>
	{/if}

	<button
		type="submit"
		class="mt-5 h-[54px] w-full cursor-pointer rounded-full bg-ink text-[15px] font-medium text-[#F7F2E8] shadow-[0_8px_24px_rgba(34,30,25,.18)] transition-colors hover:bg-[#3A342C]"
	>
		{m.add_temple_submit()}
	</button>
	<button
		type="button"
		onclick={onnone}
		class="mt-3.5 cursor-pointer text-center text-[13px] text-ink/45 hover:text-ink/70"
	>
		{m.add_temple_none()}
	</button>
</form>
