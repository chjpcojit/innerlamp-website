<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import TempleSelect from '$lib/components/ui/TempleSelect.svelte';
	import type { TempleOption } from '$lib/types/temple';
	import type { UserProfile } from '$lib/types/user';
	import { profileEditErrorMessage } from '../errors';
	import { DHARMA_NAME_MAX, FULL_NAME_MAX } from '../limits';
	import type { ProfileEditError, ProfileEditValues } from '../types';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		profile: UserProfile;
		/** Action result of the last failed save. */
		form?: { error?: ProfileEditError; values?: ProfileEditValues } | null;
	}

	let { profile, form }: Props = $props();

	// The profile only carries id/name; the picker doesn't need the province to show it.
	const initialTemple = (): TempleOption | null =>
		profile.ordination_temple
			? { ...profile.ordination_temple, province: '', province_code: null }
			: null;

	let temple = $state<TempleOption | null>(initialTemple());
	let pending = $state(false);

	const fullName = $derived(form?.values?.full_name ?? profile.full_name ?? '');
	const dharmaName = $derived(form?.values?.dharma_name ?? profile.dharma_name ?? '');
	const error = $derived(form?.error);

	const initials = $derived(
		(profile.full_name ?? '')
			.split(/\s+/)
			.filter(Boolean)
			.slice(-2)
			.map((w) => w[0])
			.join('')
			.toUpperCase()
	);

	// Backend has no field for these yet; shown disabled so the layout matches the design.
	const STATUSES = [
		() => m.pfe_status_lay(),
		() => m.pfe_status_upasaka(),
		() => m.pfe_status_monk(),
		() => m.pfe_status_nun()
	];

	const submit: SubmitFunction = () => {
		pending = true;
		return async ({ update }) => {
			await update({ reset: false });
			pending = false;
		};
	};

	const card = 'rounded-[22px] border border-ink/8 bg-paper';
	const label = 'mb-1.5 block text-xs font-medium text-ink/55';
	const input =
		'h-[46px] w-full rounded-[14px] border border-ink/12 bg-paper px-3.5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-gold disabled:cursor-not-allowed disabled:bg-cream-soft disabled:text-ink/45 aria-invalid:border-[#a7443f]/60';
</script>

<form method="POST" use:enhance={submit} class="flex max-w-[1000px] flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/tight font-medium">{m.pf_edit()}</h1>
			<p class="mt-2 text-sm text-ink/55">{m.pfe_subtitle()}</p>
		</div>
		<div class="flex gap-2.5">
			<a
				href={resolve(localizeHref('/profile') as '/profile')}
				class="rounded-full border border-ink/16 px-5 py-3 text-[13px] font-medium transition-colors hover:bg-sand/60"
			>
				{m.pfe_cancel()}
			</a>
			<button
				type="submit"
				disabled={pending}
				aria-busy={pending}
				class="cursor-pointer rounded-full bg-ink px-[22px] py-3 text-[13px] font-medium text-cream transition-colors hover:bg-[#3a342c] disabled:cursor-default disabled:opacity-60"
			>
				{pending ? m.pfe_saving() : m.pfe_save()}
			</button>
		</div>
	</div>

	{#if error}
		<p
			class="rounded-[14px] border border-[#a7443f]/25 bg-[#a7443f]/6 px-4 py-3 text-[13px] text-[#a7443f]"
			role="alert"
		>
			{profileEditErrorMessage(error)}
		</p>
	{/if}

	<section class="overflow-hidden {card}" aria-label={m.pfe_photos_label()}>
		<!-- No photo upload API yet: the cover is the profile's gradient placeholder. -->
		<div class="h-[180px] bg-[linear-gradient(150deg,#efe6d5,#e2d4bb)]"></div>
		<div class="relative -mt-11 flex flex-wrap items-end gap-[18px] px-6 pb-5">
			{#if profile.avatar_url}
				<img
					src={profile.avatar_url}
					alt={m.pfe_avatar_alt()}
					class="size-24 flex-none rounded-full border-4 border-paper object-cover"
				/>
			{:else}
				<div
					class="flex size-24 flex-none items-center justify-center rounded-full border-4 border-paper bg-sand-deep font-serif text-3xl text-gold-deep"
					aria-hidden="true"
				>
					{initials || '·'}
				</div>
			{/if}
			<p class="pb-1.5 text-xs/normal text-ink/55">{m.pfe_photos_soon()}</p>
		</div>
	</section>

	<div class="flex flex-wrap items-start gap-6">
		<section class="flex min-w-0 flex-[1_1_400px] flex-col gap-4 p-6 {card}">
			<h2 class="text-[15px] font-medium">{m.pfe_personal()}</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
				<div>
					<label for="pfe-full-name" class={label}>{m.pfe_full_name()}</label>
					<input
						id="pfe-full-name"
						name="full_name"
						type="text"
						value={fullName}
						required
						maxlength={FULL_NAME_MAX}
						autocomplete="name"
						placeholder={m.pfe_full_name_placeholder()}
						aria-invalid={error === 'full_name_required' || error === 'invalid_full_name'}
						class={input}
					/>
				</div>
				<div>
					<label for="pfe-dharma-name" class={label}>{m.pf_phap_label()}</label>
					<input
						id="pfe-dharma-name"
						name="dharma_name"
						type="text"
						value={dharmaName}
						maxlength={DHARMA_NAME_MAX}
						placeholder={m.pfe_dharma_placeholder()}
						aria-invalid={error === 'invalid_dharma_name'}
						class={input}
					/>
				</div>
				<div>
					<label for="pfe-birth" class={label}>{m.pfe_birth_year()}</label>
					<input
						id="pfe-birth"
						type="text"
						inputmode="numeric"
						disabled
						placeholder={m.pfe_birth_placeholder()}
						class={input}
					/>
				</div>
				<div>
					<label for="pfe-phone" class={label}>{m.pfe_phone()}</label>
					<input id="pfe-phone" type="tel" value={profile.phone_number} disabled class={input} />
				</div>
			</div>
			<div>
				<label for="pfe-email" class={label}>{m.pfe_email()}</label>
				<input
					id="pfe-email"
					type="email"
					value={profile.email}
					disabled
					placeholder={m.pfe_email_placeholder()}
					class={input}
				/>
			</div>
			<fieldset disabled>
				<legend class={label}>{m.pfe_status()}</legend>
				<div class="flex flex-wrap gap-2">
					{#each STATUSES as status, i (i)}
						<label
							class="cursor-not-allowed rounded-full border border-ink/12 bg-paper px-4 py-[9px] text-[13px] font-medium text-ink/72 has-checked:border-ink has-checked:bg-ink has-checked:text-cream"
						>
							<input type="radio" class="sr-only" checked={i === 0} />
							{status()}
						</label>
					{/each}
				</div>
			</fieldset>
			<div>
				<label for="pfe-bio" class={label}>{m.pfe_bio()}</label>
				<textarea
					id="pfe-bio"
					disabled
					placeholder={m.pfe_bio_placeholder()}
					class="{input} h-[110px] resize-y py-3 leading-relaxed"></textarea>
			</div>
			<p class="text-xs/relaxed text-ink/50">{m.pfe_soon_note()}</p>
		</section>

		<section class="flex min-w-0 flex-[1_1_300px] flex-col gap-4 p-6 {card}">
			<h2 class="text-[15px] font-medium">{m.pfe_sangha()}</h2>
			<div>
				<span id="pfe-temple-label" class={label}>{m.pfe_temple()}</span>
				<TempleSelect
					bind:value={temple}
					variant="field"
					labelledby="pfe-temple-label"
					noneLabel={m.pfe_temple_none()}
					noneSub={m.pfe_temple_none_sub()}
				/>
			</div>
			<div>
				<label for="pfe-refuge" class={label}>{m.pfe_refuge_date()}</label>
				<input
					id="pfe-refuge"
					type="text"
					disabled
					placeholder={m.pfe_refuge_placeholder()}
					class={input}
				/>
			</div>
			<div>
				<label for="pfe-master" class={label}>{m.pfe_master()}</label>
				<input
					id="pfe-master"
					type="text"
					disabled
					placeholder={m.pfe_master_placeholder()}
					class={input}
				/>
			</div>
			<div>
				<label for="pfe-group" class={label}>{m.pfe_group()}</label>
				<input
					id="pfe-group"
					type="text"
					disabled
					placeholder={m.pfe_group_placeholder()}
					class={input}
				/>
			</div>
		</section>
	</div>
</form>
