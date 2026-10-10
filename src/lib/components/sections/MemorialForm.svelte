<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { REMIND_LEADS, REMIND_TIMES, RELATIONS, RELATION_LABELS } from '$lib/content/memorial';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { memorial } from '$lib/state/memorial.svelte';
	import type { MemorialCalendar, MemorialEntry } from '$lib/types/memorial';
	import { nextAnniversary } from '$lib/utils/memorial';
	import { solarToLunar } from '$lib/utils/lunar';
	import {
		daysLabel,
		deathDateLabel,
		longDate,
		lunarMonthLabel,
		nthLabel
	} from '$lib/utils/memorial-format';

	interface Props {
		/** Entry to edit; omit to add a new relative. */
		id?: string;
	}

	let { id }: Props = $props();

	const blank = (): MemorialEntry => ({
		id: '',
		name: '',
		relation: 'paternal_grandfather',
		calendar: 'lunar',
		day: 1,
		month: 1,
		year: null,
		note: '',
		remind: true,
		lead: 1,
		time: '07:00',
		sync: true
	});

	// `id` never changes for a mounted form: the page remounts it per id with `{#key}`.
	// svelte-ignore state_referenced_locally
	let draft = $state<MemorialEntry | null>(id ? null : blank());
	let nameError = $state(false);

	onMount(() => memorial.init());

	// Editing: copy the stored entry once storage has loaded.
	$effect(() => {
		if (draft || !id || !memorial.ready) return;
		const found = memorial.get(id);
		if (found) draft = { ...found };
	});

	const notFound = $derived(!!id && memorial.ready && !draft);
	const isNew = $derived(!id);

	const thisYear = new Date().getFullYear();
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const years = Array.from({ length: 97 }, (_, i) => thisYear - i);

	const lunar = $derived(draft?.calendar !== 'solar');
	const dayMax = $derived(lunar ? 30 : 31);

	function setCalendar(calendar: MemorialCalendar) {
		if (!draft) return;
		draft.calendar = calendar;
		draft.day = Math.min(draft.day, calendar === 'lunar' ? 30 : 31);
	}

	const preview = $derived.by(() => {
		if (!draft) return null;
		const next = nextAnniversary(draft);
		const nth = nthLabel(next.nth);
		let detail: string;
		if (draft.calendar === 'lunar') {
			detail =
				deathDateLabel(draft) + (nth ? ' · ' + nth : '') + '. ' + m.mem_preview_short_month();
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

	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!draft) return;
		if (!draft.name.trim()) {
			nameError = true;
			return;
		}
		memorial.save({
			...$state.snapshot(draft),
			id: draft.id || crypto.randomUUID(),
			name: draft.name.trim()
		});
		void goto(resolve(localizeHref('/memorial') as '/memorial'));
	}

	function remove() {
		if (!id) return;
		memorial.remove(id);
		void goto(resolve(localizeHref('/memorial') as '/memorial'));
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
{:else if draft}
	<form class="flex max-w-[1000px] flex-col gap-6" onsubmit={save} novalidate>
		<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium">
			{isNew ? m.mem_form_add() : m.mem_form_edit()}
		</h1>

		<div class="flex flex-wrap items-start gap-7">
			<div class="flex min-w-0 flex-[1_1_320px] flex-col gap-[22px]">
				<div>
					<label for="mem-name" class={eyebrow}>{m.mem_f_name()}</label>
					<input
						id="mem-name"
						type="text"
						bind:value={draft.name}
						oninput={() => (nameError = false)}
						placeholder={m.mem_f_name_ph()}
						aria-invalid={nameError}
						aria-describedby={nameError ? 'mem-name-err' : undefined}
						class="mt-[7px] h-12 w-full rounded-[14px] border bg-paper px-4 text-[15px] outline-none focus:border-gold {nameError
							? 'border-[#c2857f]'
							: 'border-ink/12'}"
					/>
					{#if nameError}
						<p id="mem-name-err" role="alert" class="mt-1.5 text-xs text-[#a7443f]">
							{m.mem_f_name_err()}
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
								onclick={() => draft && (draft.relation = r)}
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
						rows="3"
						bind:value={draft.note}
						placeholder={m.mem_f_note_ph()}
						class="mt-[7px] block w-full resize-none rounded-[14px] border border-ink/12 bg-paper px-4 py-[13px] text-sm/[1.6] outline-none focus:border-gold"
					></textarea>
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
							<select bind:value={draft.day} class="{select} mt-[5px] text-ink">
								{#each Array.from({ length: dayMax }, (_, i) => i + 1) as d (d)}
									<option value={d}>{lunar && d <= 10 ? m.mem_day_early({ n: d }) : d}</option>
								{/each}
							</select>
						</label>
						<label class="text-xs text-ink/45">
							{m.mem_f_month()}
							<select bind:value={draft.month} class="{select} mt-[5px] text-ink">
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
							<select bind:value={draft.year} class="{select} mt-[5px] text-ink">
								<option value={null}>{m.mem_year_unknown()}</option>
								{#each years as y (y)}
									<option value={y}>{y}</option>
								{/each}
							</select>
						</label>
					</div>
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
								checked={draft.remind}
								label={m.mem_remind_title()}
								onchange={(v) => draft && (draft.remind = v)}
							/>
						</div>
						{#if draft.remind}
							<div class="my-3.5 h-px bg-ink/6"></div>
							<p class="text-xs text-ink/55">{m.mem_remind_when()}</p>
							<div class="mt-2.5 flex flex-wrap gap-2">
								{#each REMIND_LEADS as l (l)}
									<button
										type="button"
										aria-pressed={draft.lead === l}
										onclick={() => draft && (draft.lead = l)}
										class="{chip} {draft.lead === l ? chipOn : chipOff}"
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
										aria-pressed={draft.time === t}
										onclick={() => draft && (draft.time = t)}
										class="{chip} {draft.time === t ? chipOn : chipOff}"
									>
										{t}
									</button>
								{/each}
							</div>
							<div class="my-3.5 h-px bg-ink/6"></div>
							<div class="flex items-center gap-3">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium">{m.mem_sync_title()}</p>
									<p class="mt-0.5 text-xs/normal text-pretty text-ink/55">{m.mem_sync_desc()}</p>
								</div>
								<Toggle
									checked={draft.sync}
									label={m.mem_sync_title()}
									onchange={(v) => draft && (draft.sync = v)}
								/>
							</div>
						{/if}
					</div>
				</fieldset>
			</div>
		</div>

		<div class="flex flex-wrap gap-2.5 border-t border-ink/8 pt-[18px]">
			<button
				type="submit"
				data-keep-dark
				class="h-[50px] cursor-pointer rounded-full bg-ink px-7 text-sm font-medium text-cream shadow-[0_8px_24px_rgba(34,30,25,.16)] hover:bg-[#3a342c]"
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
					onclick={remove}
					class="ml-auto h-[50px] cursor-pointer rounded-full border border-[#a7443f]/35 px-6 text-sm font-medium text-[#a7443f] hover:bg-[#a7443f]/6"
				>
					{m.mem_delete()}
				</button>
			{/if}
		</div>
	</form>
{/if}
