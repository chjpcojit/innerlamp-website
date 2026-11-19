<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { REMIND_LEADS, REMIND_TIMES, RELATIONS, RELATION_LABELS } from '$lib/content/memorial';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import type {
		MemorialActionErrors,
		MemorialCalendar,
		MemorialDraft,
		MemorialEntry
	} from '$lib/types/memorial';
	import { nextAnniversary } from '$lib/utils/memorial';
	import { canStartMemorialSubmit } from '$lib/utils/memorial-submit';
	import { solarToLunar } from '$lib/utils/lunar';
	import { validateMemorialForm } from '$lib/utils/memorial-validate';
	import {
		daysLabel,
		deathDateLabel,
		initials,
		longDate,
		lunarMonthLabel,
		nthLabel
	} from '$lib/utils/memorial-format';

	interface Props {
		/** Entry to edit; null when adding. */
		entry: MemorialEntry | null;
		isNew: boolean;
		notFound?: boolean;
		loadError?: boolean;
		photoEnabled?: boolean;
		/** Posted values after a failed submit (no-JS fallback). */
		values?: Record<string, string>;
		/** Field errors from the server action. */
		formErrors?: MemorialActionErrors;
	}

	let {
		entry,
		isNew,
		notFound = false,
		loadError = false,
		photoEnabled = false,
		values,
		formErrors
	}: Props = $props();

	const blank = (): MemorialDraft => ({
		name: '',
		relation: 'paternal_grandfather',
		calendar: 'lunar',
		day: 1,
		month: 1,
		year: null,
		leap: false,
		note: '',
		reminder: { lead: 1, time: '07:00' }
	});

	const fromEntry = (e: MemorialEntry): MemorialDraft => ({
		name: e.name,
		relation: e.relation,
		calendar: e.calendar,
		day: e.day,
		month: e.month,
		year: e.year,
		leap: e.leap,
		note: e.note,
		reminder: e.reminder
	});

	const fromValues = (v: Record<string, string>): MemorialDraft => ({
		name: v.name ?? '',
		relation: (RELATIONS as readonly string[]).includes(v.relation ?? '')
			? (v.relation as MemorialDraft['relation'])
			: 'paternal_grandfather',
		calendar: v.calendar === 'solar' ? 'solar' : 'lunar',
		day: Number(v.day ?? 1) || 1,
		month: Number(v.month ?? 1) || 1,
		year: v.year ? Number(v.year) : null,
		leap: v.leap === 'true',
		note: v.note ?? '',
		reminder:
			v.reminder_on === 'true' ? { lead: Number(v.lead ?? 1), time: v.time ?? '07:00' } : null
	});

	// Initialised once: the page remounts the form per id with `{#key}`.
	// svelte-ignore state_referenced_locally
	let draft = $state<MemorialDraft>(
		values ? fromValues(values) : entry ? fromEntry(entry) : blank()
	);

	/** Device date for the preview; null on the server so hydration never disagrees (BR-MEM-08). */
	let today = $state<Date | null>(null);
	onMount(() => (today = new Date()));

	let submitting = $state(false);
	let clientErrors = $state<MemorialActionErrors>({});
	let showServerErrors = $state(true);
	const errors = $derived<MemorialActionErrors>(
		showServerErrors ? { ...clientErrors, ...(formErrors ?? {}) } : clientErrors
	);

	function clearErrors() {
		clientErrors = {};
		showServerErrors = false;
	}

	const thisYear = $derived(today?.getFullYear() ?? new Date().getFullYear());
	const years = $derived(Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i));
	const months = Array.from({ length: 12 }, (_, i) => i + 1);

	const lunar = $derived(draft.calendar === 'lunar');
	const dayMax = $derived.by(() => {
		if (lunar) return 30;
		const year = draft.year ?? 2024; // February may be 29 without a year (contract §2.3)
		return new Date(year, draft.month, 0).getDate();
	});

	function setCalendar(calendar: MemorialCalendar) {
		draft.calendar = calendar;
		if (calendar === 'solar') draft.leap = false;
		draft.day = Math.min(draft.day, calendar === 'lunar' ? 30 : dayMax);
	}

	function setReminder(on: boolean) {
		draft.reminder = on ? (draft.reminder ?? { lead: 1, time: '07:00' }) : null;
	}

	const preview = $derived.by(() => {
		if (!today) return null;
		const next = nextAnniversary(draft, today);
		const nth = nthLabel(next.nth);
		let detail: string;
		if (draft.calendar === 'lunar') {
			detail =
				deathDateLabel({ ...draft, year: draft.year }) +
				(nth ? ' · ' + nth : '') +
				'. ' +
				m.mem_preview_short_month();
		} else {
			const l = solarToLunar(next.date);
			detail = m.mem_preview_solar_in_lunar({
				date: m.mem_date_lunar({ day: l.day, month: lunarMonthLabel(l.month) })
			});
			if (nth) detail += ' · ' + nth;
		}
		return {
			first: m.mem_preview_next({
				date: longDate(next.date),
				when: daysLabel(next.days).toLowerCase()
			}),
			detail
		};
	});

	const photoSrc = (id: number) =>
		resolve(localizeHref(`/memorial/${id}/photo`) as '/memorial/[id]/photo');

	const errorKey = (code?: string): (() => string) | null => {
		switch (code) {
			case 'empty':
				return () => m.mem_f_name_err();
			case 'long':
				return () => m.mem_f_name_too_long();
			case 'note_long':
				return () => m.mem_f_note_too_long();
			case 'invalid':
				return () => m.mem_f_date_invalid();
			case 'not_exist':
				return () => m.mem_f_date_not_exist({ year: draft.year ?? '', month: draft.month });
			case 'future':
				return () => m.mem_f_date_future();
			case 'year_min':
				return () => m.mem_f_year_min();
			case 'reminder_invalid':
				return () => m.mem_err_save();
			case 'full':
				return () => m.mem_err_full();
			case 'delete':
				return () => m.mem_err_delete();
			case 'too_large':
				return () => m.mem_photo_too_large();
			case 'unsupported':
				return () => m.mem_photo_unsupported();
			case 'failed':
				return () => m.mem_err_photo();
			default:
				return null;
		}
	};

	const banner = $derived(
		errors.form === 'auth'
			? m.mem_err_session
			: errors.form === 'full'
				? m.mem_err_full
				: errors.form === 'delete'
					? m.mem_err_delete
					: errors.form === 'save'
						? m.mem_err_save
						: null
	);

	let deleteButton = $state<HTMLButtonElement | null>(null);
	let dialog = $state<HTMLDialogElement | null>(null);
	let photoError = $state<(() => string) | null>(null);
	let photoPreview = $state<string | null>(null);

	function checkPhoto(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		photoError = null;
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			photoError = m.mem_photo_too_large;
			input.value = '';
			return;
		}
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			photoError = m.mem_photo_unsupported;
			input.value = '';
			return;
		}
		photoPreview = URL.createObjectURL(file);
	}

	function onEnhance() {
		showServerErrors = true;
		clientErrors = {};
		const checked = validateMemorialForm({
			name: draft.name,
			relation: draft.relation,
			calendar: draft.calendar,
			day: draft.day,
			month: draft.month,
			year: draft.year,
			leap: draft.leap,
			note: draft.note,
			reminderOn: draft.reminder !== null,
			lead: draft.reminder?.lead ?? 1,
			time: draft.reminder?.time ?? '07:00'
		});
		if (!checked.valid) {
			clientErrors = checked.errors;
			return false;
		}
		return true;
	}

	const chip =
		'cursor-pointer rounded-full border px-3.5 py-[9px] text-xs font-medium transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink hover:bg-white';
	const eyebrow = 'text-xs tracking-[.06em] text-ink/48 uppercase';
	const select =
		'h-12 w-full rounded-[14px] border border-ink/12 bg-paper px-3.5 text-sm outline-none focus:border-gold';
</script>

{#if notFound}
	<section class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2]">{m.mem_not_found()}</h1>
		<a
			href={resolve(localizeHref('/memorial') as '/memorial')}
			class="rounded-full border border-ink/20 px-5 py-2.5 text-[13.5px] font-medium hover:bg-sand/60"
		>
			{m.mem_back()}
		</a>
	</section>
{:else if loadError}
	<section class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2]">{m.mem_err_load()}</h1>
		<a
			href={resolve(localizeHref('/memorial') as '/memorial')}
			class="rounded-full border border-ink/20 px-5 py-2.5 text-[13.5px] font-medium hover:bg-sand/60"
		>
			{m.mem_retry()}
		</a>
	</section>
{:else}
	<form
		method="POST"
		action={isNew ? '' : '?/save'}
		use:enhance={({ cancel }) => {
			// The gate is checked before the request starts; `submitting` blocks a double click.
			if (!canStartMemorialSubmit({ pending: submitting, valid: onEnhance() })) {
				cancel();
				return;
			}
			submitting = true;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					submitting = false;
				}
			};
		}}
		class="flex max-w-[1000px] flex-col gap-6"
		novalidate
	>
		<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium">
			{isNew ? m.mem_form_add() : m.mem_form_edit()}
		</h1>

		{#if banner}
			<p role="alert" class="rounded-[14px] bg-[#a7443f]/8 px-4 py-3 text-[13px] text-[#a7443f]">
				{banner()}
				{#if errors.form === 'auth'}
					<a href={resolve(localizeHref('/login') as '/login')} class="ml-1 underline">
						{m.header_login()}
					</a>
				{/if}
			</p>
		{/if}

		<input type="hidden" name="relation" value={draft.relation} />
		<input type="hidden" name="calendar" value={draft.calendar} />
		<input type="hidden" name="leap" value={draft.leap ? 'true' : 'false'} />
		<input type="hidden" name="reminder_on" value={draft.reminder ? 'true' : 'false'} />
		<input type="hidden" name="lead" value={draft.reminder?.lead ?? 1} />
		<input type="hidden" name="time" value={draft.reminder?.time ?? '07:00'} />

		<div class="flex flex-wrap items-start gap-7">
			<div class="flex min-w-0 flex-[1_1_320px] flex-col gap-[22px]">
				<div>
					<label for="mem-name" class={eyebrow}>{m.mem_f_name()}</label>
					<input
						id="mem-name"
						name="name"
						type="text"
						bind:value={draft.name}
						oninput={clearErrors}
						placeholder={m.mem_f_name_ph()}
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? 'mem-name-err' : undefined}
						class="mt-[7px] h-12 w-full rounded-[14px] border bg-paper px-4 text-[15px] outline-none focus:border-gold {errors.name
							? 'border-[#c2857f]'
							: 'border-ink/12'}"
					/>
					{#if errors.name}
						<p id="mem-name-err" role="alert" class="mt-1.5 text-xs text-[#a7443f]">
							{errorKey(errors.name)?.()}
						</p>
					{/if}
				</div>

				<fieldset>
					<legend class={eyebrow}>{m.mem_f_relation()}</legend>
					<div class="mt-2.5 flex flex-wrap gap-2">
						{#each RELATIONS as r (r)}
							<button
								type="button"
								aria-pressed={draft.relation === r}
								onclick={() => {
									draft.relation = r;
									clearErrors();
								}}
								class="{chip} {draft.relation === r ? chipOn : chipOff}"
							>
								{RELATION_LABELS[r]()}
							</button>
						{/each}
					</div>
				</fieldset>

				<div>
					<label for="mem-note" class={eyebrow}>{m.mem_f_note()}</label>
					<textarea
						id="mem-note"
						name="note"
						rows="3"
						bind:value={draft.note}
						oninput={clearErrors}
						placeholder={m.mem_f_note_ph()}
						aria-invalid={!!errors.note}
						class="mt-[7px] block w-full resize-none rounded-[14px] border border-ink/12 bg-paper px-4 py-[13px] text-sm/[1.6] outline-none focus:border-gold"
					></textarea>
					{#if errors.note}
						<p role="alert" class="mt-1.5 text-xs text-[#a7443f]">
							{errorKey(errors.note)?.()}
						</p>
					{/if}
				</div>
			</div>

			<div class="flex min-w-0 flex-[1.2_1_380px] flex-col gap-[22px]">
				<fieldset>
					<legend class={eyebrow}>{m.mem_f_death()}</legend>
					<div class="mt-2.5">
						<Segmented
							label={m.mem_f_death()}
							value={draft.calendar}
							options={[
								{ value: 'lunar', label: m.mem_cal_lunar() },
								{ value: 'solar', label: m.mem_cal_solar() }
							]}
							onchange={setCalendar}
						/>
					</div>
					<div class="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)] gap-2">
						<label class="text-xs text-ink/45">
							{m.mem_f_day()}
							<select
								name="day"
								bind:value={draft.day}
								onchange={clearErrors}
								class="{select} mt-[5px] text-ink"
							>
								{#each Array.from({ length: dayMax }, (_, i) => i + 1) as d (d)}
									<option value={d}>{lunar && d <= 10 ? m.mem_day_early({ n: d }) : d}</option>
								{/each}
							</select>
						</label>
						<label class="text-xs text-ink/45">
							{m.mem_f_month()}
							<select
								name="month"
								bind:value={draft.month}
								onchange={clearErrors}
								class="{select} mt-[5px] text-ink"
							>
								{#each months as n (n)}
									<option value={n}>
										{lunar
											? m.mem_month_lunar({ name: lunarMonthLabel(n) })
											: m.mem_month_solar({ n })}
									</option>
								{/each}
							</select>
						</label>
						<label class="text-xs text-ink/45">
							{m.mem_f_year()}
							<select
								name="year"
								bind:value={draft.year}
								onchange={clearErrors}
								class="{select} mt-[5px] text-ink"
							>
								<option value={null}>{m.mem_year_unknown()}</option>
								{#each years as y (y)}
									<option value={y}>{y}</option>
								{/each}
							</select>
						</label>
					</div>
					{#if lunar}
						<label class="mt-2.5 flex items-center gap-2 text-xs text-ink/60">
							<input
								type="checkbox"
								checked={draft.leap}
								onchange={(e) => {
									draft.leap = e.currentTarget.checked;
									clearErrors();
								}}
								class="size-4 accent-gold"
							/>
							{m.mem_f_leap()}
						</label>
					{/if}
					{#if errors.date}
						<p role="alert" class="mt-1.5 text-xs text-[#a7443f]">
							{errorKey(errors.date)?.()}
						</p>
					{/if}
					{#if preview}
						<div
							class="mt-2.5 rounded-[14px] bg-gold/10 px-3.5 py-3 text-xs/[1.6]"
							aria-live="polite"
						>
							<p>{preview.first}</p>
							<p class="text-ink/55">{preview.detail}</p>
						</div>
					{/if}
				</fieldset>

				<fieldset>
					<legend class={eyebrow}>{m.mem_f_reminder()}</legend>
					<div class="mt-2.5 rounded-[20px] border border-ink/8 bg-paper p-[18px]">
						<div class="flex items-center gap-3">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium">{m.mem_remind_title()}</p>
								<p class="mt-0.5 text-xs/normal text-ink/55">{m.mem_remind_desc()}</p>
							</div>
							<Toggle
								checked={draft.reminder !== null}
								label={m.mem_remind_title()}
								onchange={(v) => {
									setReminder(v);
									clearErrors();
								}}
							/>
						</div>
						{#if draft.reminder}
							<div class="my-3.5 h-px bg-ink/6"></div>
							<p class="text-xs text-ink/55">{m.mem_remind_when()}</p>
							<div class="mt-2.5 flex flex-wrap gap-2">
								{#each REMIND_LEADS as l (l)}
									<button
										type="button"
										aria-pressed={draft.reminder.lead === l}
										onclick={() => draft.reminder && (draft.reminder.lead = l)}
										class="{chip} {draft.reminder.lead === l ? chipOn : chipOff}"
									>
										{l ? m.mem_remind_before({ count: l }) : m.mem_remind_on_day()}
									</button>
								{/each}
							</div>
							<p class="mt-3.5 text-xs text-ink/55">{m.mem_remind_time()}</p>
							<div class="mt-2.5 flex flex-wrap gap-2">
								{#each REMIND_TIMES as t (t)}
									<button
										type="button"
										aria-pressed={draft.reminder.time === t}
										onclick={() => draft.reminder && (draft.reminder.time = t)}
										class="{chip} {draft.reminder.time === t ? chipOn : chipOff}"
									>
										{t}
									</button>
								{/each}
							</div>
						{/if}
						{#if errors.reminder}
							<p role="alert" class="mt-2.5 text-xs text-[#a7443f]">
								{errorKey(errors.reminder)?.()}
							</p>
						{/if}
					</div>
				</fieldset>
			</div>
		</div>

		<div class="flex flex-wrap gap-2.5 border-t border-ink/8 pt-[18px]">
			<button
				type="submit"
				disabled={submitting}
				data-keep-dark
				class="h-[50px] cursor-pointer rounded-full bg-ink px-7 text-sm font-medium text-cream shadow-[0_8px_24px_rgba(34,30,25,.16)] hover:bg-[#3a342c] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isNew ? m.mem_save_new() : m.mem_save_edit()}
			</button>
			<a
				href={resolve(localizeHref('/memorial') as '/memorial')}
				class="flex h-[50px] items-center rounded-full border border-ink/18 px-6 text-sm font-medium hover:bg-sand/60"
			>
				{m.mem_cancel()}
			</a>
			{#if !isNew}
				<button
					type="button"
					onclick={() => dialog?.showModal()}
					class="ml-auto h-[50px] cursor-pointer rounded-full border border-[#a7443f]/35 px-6 text-sm font-medium text-[#a7443f] hover:bg-[#a7443f]/6"
				>
					{m.mem_delete()}
				</button>
				<button
					type="submit"
					formaction="?/delete"
					bind:this={deleteButton}
					class="hidden"
					aria-hidden="true"
					tabindex="-1"
				></button>
			{/if}
		</div>
	</form>

	{#if !isNew && photoEnabled}
		<section class="mt-8 max-w-[1000px] rounded-[22px] border border-ink/8 bg-paper p-5">
			<h2 class="text-sm font-medium">{m.mem_photo_title()}</h2>
			<p class="mt-1 text-xs/normal text-ink/55">{m.mem_photo_desc()}</p>
			<div class="mt-4 flex flex-wrap items-center gap-4">
				{#if photoPreview || entry?.hasPhoto}
					<img
						src={photoPreview ?? photoSrc(entry?.id ?? 0)}
						alt={entry?.name ?? ''}
						referrerpolicy="no-referrer"
						class="size-20 flex-none rounded-full object-cover"
					/>
				{:else}
					<span
						class="flex size-20 flex-none items-center justify-center rounded-full bg-gold/14 font-serif text-2xl text-gold-deep"
						aria-hidden="true"
					>
						{initials(entry?.name ?? '')}
					</span>
				{/if}
				<form
					method="POST"
					action="?/photo"
					enctype="multipart/form-data"
					class="flex flex-wrap items-center gap-2"
				>
					<input
						type="file"
						name="photo"
						accept="image/jpeg,image/png,image/webp"
						onchange={checkPhoto}
						class="text-xs"
					/>
					<button
						type="submit"
						class="h-10 cursor-pointer rounded-full bg-ink px-4 text-xs font-medium text-cream"
					>
						{m.mem_photo_choose()}
					</button>
				</form>
				{#if entry?.hasPhoto}
					<form method="POST" action="?/photoDelete">
						<button
							type="submit"
							class="h-10 cursor-pointer rounded-full border border-[#a7443f]/35 px-4 text-xs font-medium text-[#a7443f]"
						>
							{m.mem_photo_remove()}
						</button>
					</form>
				{/if}
			</div>
			{#if photoError || errors.photo}
				<p role="alert" class="mt-2 text-xs text-[#a7443f]">
					{photoError?.() ?? errorKey(errors.photo)?.()}
				</p>
			{/if}
		</section>
	{/if}

	<dialog
		bind:this={dialog}
		class="max-w-[420px] rounded-[22px] border border-ink/10 bg-cream p-6 text-ink backdrop:bg-black/40"
	>
		<h2 class="font-serif text-[24px]/[1.25] font-medium">
			{m.mem_confirm_delete_title({ name: draft.name || entry?.name || '' })}
		</h2>
		<p class="mt-2 text-sm/[1.6] text-ink/60">{m.mem_confirm_delete_desc()}</p>
		<div class="mt-5 flex justify-end gap-2.5">
			<button
				type="button"
				onclick={() => dialog?.close()}
				class="h-11 cursor-pointer rounded-full border border-ink/18 px-5 text-sm font-medium"
			>
				{m.mem_confirm_delete_cancel()}
			</button>
			<button
				type="button"
				onclick={() => {
					dialog?.close();
					deleteButton?.click();
				}}
				class="h-11 cursor-pointer rounded-full bg-[#a7443f] px-5 text-sm font-medium text-white"
			>
				{m.mem_confirm_delete_ok()}
			</button>
		</div>
	</dialog>

	<noscript>
		{#if !isNew}
			<section class="mt-6 max-w-[1000px] rounded-[18px] border border-[#a7443f]/30 p-4">
				<p class="text-sm font-medium">{m.mem_confirm_delete_title({ name: draft.name })}</p>
				<p class="mt-1 text-sm text-ink/60">{m.mem_confirm_delete_desc()}</p>
				<form method="POST" action="?/delete" class="mt-3">
					<input type="hidden" name="name" value={draft.name} />
					<button
						type="submit"
						class="h-10 cursor-pointer rounded-full bg-[#a7443f] px-4 text-sm font-medium text-white"
					>
						{m.mem_confirm_delete_ok()}
					</button>
				</form>
			</section>
		{/if}
	</noscript>
{/if}
