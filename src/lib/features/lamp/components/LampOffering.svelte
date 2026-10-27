<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import {
		DEFAULT_LAMP_DAYS,
		LAMP_DAYS,
		LAMP_PURPOSES,
		LAMP_TYPES,
		lampPurpose,
		lampType
	} from '$lib/content/lamps';
	import { lampErrorMessage } from '$lib/features/lamp/errors';
	import type { LampError } from '$lib/features/lamp/types';
	import { validateLampInput } from '$lib/features/lamp/validation';
	import type { Lamp, LampDuration } from '$lib/types/lamp';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		/** Brings the garden into view. / Cuộn tới vườn đèn. */
		onToGarden: () => void;
	}

	let { onToGarden }: Props = $props();

	const IGNITE_MS = 2100;
	const HERO_MOVE_MS = 950;
	const EASE = 'cubic-bezier(.2,.8,.2,1)';
	// End moment from the server's `end_at`, in the device time zone and locale (NFR-LMP-03).
	// / Thời điểm tắt lấy từ `end_at` của server, theo múi giờ và ngôn ngữ của thiết bị.
	const dateFormat = new Intl.DateTimeFormat(getLocale(), {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	let type = $state(0);
	let purpose = $state(0);
	let name = $state('');
	let wish = $state('');
	let days = $state<LampDuration>(DEFAULT_LAMP_DAYS);
	/** Kept on "light another" (privacy-safe side). / Giữ nguyên khi "Thắp thêm đèn". */
	let hideName = $state(false);
	let phase = $state<'form' | 'igniting' | 'lit'>('form');
	/** True after "light another", so the form fields rise in again. */
	let returned = $state(false);
	let current = $state<Lamp | null>(null);
	let error = $state<LampError | null>(null);

	/** The lamp column's lamp block; slides between the form and centred layouts. */
	let hero = $state<HTMLElement>();

	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	const burning = $derived(phase !== 'form');
	const canShare = $derived(typeof navigator !== 'undefined' && 'share' in navigator);

	const caption = $derived.by(() => {
		if (!current) return m.lamp_caption_idle();
		const purpose = lampPurpose(current.intention).name();
		return current.recipient
			? m.lamp_caption_for({ purpose, name: current.recipient })
			: m.lamp_caption_all({ purpose });
	});
	const until = $derived(
		current
			? m.lamp_until({
					date: dateFormat.format(new Date(current.end_at)),
					days: current.duration_days
				})
			: ''
	);

	/**
	 * FLIP: run `change`, then slide the lamp from where it was to where the new
	 * layout puts it, instead of letting it jump.
	 */
	async function moveHero(change: () => void) {
		const el = hero;
		const first = el?.getBoundingClientRect();
		change();
		if (!el || !first) return;
		await tick();
		const last = el.getBoundingClientRect();
		const dx = first.left - last.left;
		const dy = first.top - last.top;
		if (!dx && !dy) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
			duration: HERO_MOVE_MS,
			easing: 'cubic-bezier(.22,.8,.2,1)'
		});
	}

	/** The ignition animation always plays in full, however fast the backend answers. */
	const ignition = () => new Promise<void>((resolve) => (timer = setTimeout(resolve, IGNITE_MS)));

	const light: SubmitFunction = ({ cancel, formData }) => {
		if (phase !== 'form') return cancel();
		// Same rules as the server; invalid input never starts the ignition or a request.
		// / Cùng luật với server; dữ liệu sai thì không đốt đèn và không gửi request.
		const checked = validateLampInput({
			lamp_type: String(formData.get('lamp_type') ?? ''),
			intention: String(formData.get('intention') ?? ''),
			recipient: String(formData.get('recipient') ?? ''),
			prayer: String(formData.get('prayer') ?? ''),
			duration_days: Number(formData.get('duration_days'))
		});
		if (!checked.valid) {
			error = 'invalid';
			return cancel();
		}
		phase = 'igniting';
		error = null;
		const ignited = ignition();
		return async ({ result, update }) => {
			await ignited;
			if (result.type !== 'success' || !result.data?.lamp) {
				phase = 'form';
				error =
					result.type === 'failure'
						? ((result.data?.lampError as LampError | undefined) ?? 'failed')
						: 'failed';
				return;
			}
			const lamp = result.data.lamp as Lamp;
			await moveHero(() => {
				current = lamp;
				phase = 'lit';
			});
			// Reloads the garden so the new lamp shows up there.
			await update({ reset: false });
		};
	};

	function again() {
		void moveHero(() => {
			phase = 'form';
			returned = true;
			name = '';
			wish = '';
			current = null;
		});
	}

	async function share() {
		try {
			await navigator.share({ title: caption, text: current?.prayer || caption });
		} catch {
			// dismissed by the user — nothing to do
		}
	}

	/** Staggered entrance for the n-th form row after returning to the form. */
	const formRise = (n: number) =>
		returned
			? `il-rise${(n % 3) + 1} ${0.75 + (n % 2) * 0.15}s ${EASE} ${(0.12 + n * 0.08).toFixed(2)}s both`
			: undefined;
	const doneRise = (n: 1 | 2 | 3 | 4 | 5) =>
		({
			1: `il-rise1 .8s ${EASE} .12s both`,
			2: `il-rise2 .9s ${EASE} .3s both`,
			3: `il-rise2 .85s ${EASE} .42s both`,
			4: `il-rise3 .95s ${EASE} .56s both`,
			5: `il-rise2 .9s ${EASE} .72s both`
		})[n];

	const label = 'mb-2.5 block text-xs font-medium text-[#f2ebdd]/55';
	const chip =
		'cursor-pointer rounded-full border px-[15px] py-[9px] text-[13px] font-medium transition-colors';
	const chipOn = 'border-amber-light bg-amber-light text-[#1a1611]';
	const chipOff = 'border-[#f2ebdd]/14 bg-[#f2ebdd]/5 text-[#f2ebdd] hover:bg-[#f2ebdd]/10';
	const field =
		'w-full rounded-[14px] border border-[#f2ebdd]/14 bg-[#f2ebdd]/5 px-3.5 py-3 text-sm text-[#f5eee0] outline-none placeholder:text-[#f2ebdd]/35 focus:border-amber-light';
</script>

<section
	data-keep-dark
	aria-labelledby="lamp-title"
	class="relative flex flex-wrap items-center gap-10 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_70%_40%,#2a241c,#0f0d0a_72%)] p-[clamp(24px,4vw,48px)] text-[#f5eee0]"
>
	<div
		class="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_72%_46%,rgba(243,198,115,.22),transparent_55%)] transition-opacity duration-2000 {burning
			? 'opacity-100'
			: 'opacity-0'}"
	></div>

	<div
		class="relative flex min-w-0 flex-[1_1_360px] flex-col gap-[22px] {phase === 'lit'
			? 'items-center text-center'
			: 'items-stretch text-start'}"
	>
		<div
			class="il-motion"
			style:animation={phase === 'lit'
				? doneRise(1)
				: returned
					? `il-rise1 .7s ${EASE} .05s both`
					: undefined}
		>
			<p class="text-[10.5px] font-semibold tracking-[.18em] text-[#e8b061] uppercase">
				{m.lamp_eyebrow()}
			</p>
			<h1 id="lamp-title" class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.2] font-medium">
				{m.lamp_title()}
			</h1>
			<p class="mt-2.5 max-w-[440px] text-sm/[1.65] text-pretty text-[#f2ebdd]/62">
				{m.lamp_desc()}
			</p>
		</div>

		{#if phase !== 'lit'}
			<form method="POST" action="?/light" class="flex flex-col gap-5" use:enhance={light}>
				<input type="hidden" name="lamp_type" value={LAMP_TYPES[type].code} />
				<input type="hidden" name="intention" value={LAMP_PURPOSES[purpose].code} />
				<input type="hidden" name="duration_days" value={days} />
				<fieldset class="il-motion" style:animation={formRise(1)}>
					<legend class={label}>{m.lamp_field_type()}</legend>
					<div class="flex flex-wrap gap-1.5">
						{#each LAMP_TYPES as t, i (i)}
							<button
								type="button"
								aria-pressed={type === i}
								onclick={() => (type = i)}
								class="{chip} {type === i ? chipOn : chipOff}"
							>
								{t.name()}
							</button>
						{/each}
					</div>
				</fieldset>

				<fieldset class="il-motion" style:animation={formRise(2)}>
					<legend class={label}>{m.lamp_field_purpose()}</legend>
					<div class="flex flex-wrap gap-1.5">
						{#each LAMP_PURPOSES as p, i (i)}
							<button
								type="button"
								aria-pressed={purpose === i}
								onclick={() => (purpose = i)}
								class="{chip} {purpose === i ? chipOn : chipOff}"
							>
								{p.name()}
							</button>
						{/each}
					</div>
				</fieldset>

				<div class="il-motion" style:animation={formRise(3)}>
					<label for="lamp-name" class={label}>{m.lamp_field_for()}</label>
					<input
						id="lamp-name"
						name="recipient"
						bind:value={name}
						aria-describedby="lamp-name-notice"
						placeholder={m.lamp_field_for_placeholder()}
						class={field}
					/>
					<p id="lamp-name-notice" class="mt-2 text-xs text-[#f2ebdd]/50">
						{m.lamp_recipient_notice()}
					</p>
				</div>

				<div class="il-motion" style:animation={formRise(4)}>
					<label for="lamp-wish" class={label}>{m.lamp_field_wish()}</label>
					<textarea
						id="lamp-wish"
						name="prayer"
						bind:value={wish}
						rows="3"
						placeholder={m.lamp_field_wish_placeholder()}
						class="{field} resize-none leading-relaxed"></textarea>
				</div>

				<fieldset class="il-motion" style:animation={formRise(5)}>
					<legend class={label}>{m.lamp_field_days()}</legend>
					<div class="flex flex-wrap gap-2">
						{#each LAMP_DAYS as d (d)}
							<button
								type="button"
								aria-pressed={days === d}
								onclick={() => (days = d)}
								class="w-16 cursor-pointer rounded-2xl border py-2.5 text-center transition-colors {days ===
								d
									? chipOn
									: chipOff}"
							>
								<span class="block font-serif text-[22px]/tight font-medium">{d}</span>
								<span class="block text-[10.5px] opacity-60">{m.lamp_days_unit()}</span>
							</button>
						{/each}
					</div>
				</fieldset>

				<label
					class="il-motion flex cursor-pointer items-center justify-between gap-4 self-stretch"
					style:animation={formRise(6)}
				>
					<span class="text-sm text-[#f2ebdd]/85">{m.lamp_field_hide_name()}</span>
					<input
						type="checkbox"
						role="switch"
						name="is_anonymous"
						value="true"
						bind:checked={hideName}
						class="peer sr-only"
					/>
					<span
						aria-hidden="true"
						class="relative h-6 w-11 flex-none rounded-full border border-[#f2ebdd]/20 bg-[#f2ebdd]/10 transition-colors peer-checked:border-amber-light peer-checked:bg-amber-light peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-light after:absolute after:top-0.5 after:left-0.5 after:size-[18px] after:rounded-full after:bg-[#f5eee0] after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-[#1a1611]"
					></span>
				</label>

				{#if error}
					<p class="text-[13px] text-[#f0a49e]" role="alert">{lampErrorMessage(error)}</p>
				{/if}

				<div
					class="il-motion flex flex-wrap items-center gap-x-6 gap-y-3"
					style:animation={formRise(7)}
				>
					<button
						type="submit"
						disabled={phase === 'igniting'}
						class="cursor-pointer rounded-full bg-amber px-[34px] py-[15px] text-[15px] font-medium whitespace-nowrap text-[#1a1611] transition-opacity hover:bg-[#e6a94e] disabled:opacity-60"
					>
						{phase === 'igniting' ? m.lamp_lighting() : m.lamp_light()}
					</button>
					<button
						type="button"
						onclick={onToGarden}
						class="cursor-pointer text-[13px] font-medium text-[#e8b061] underline-offset-4 hover:underline"
					>
						{m.lamp_to_garden()}
					</button>
				</div>
			</form>
		{:else}
			<div class="flex flex-col items-center gap-4">
				<p
					class="il-motion max-w-[440px] font-serif text-lg/[1.7] text-[#f2ebdd]/82 italic"
					style:animation={doneRise(3)}
				>
					{m.lamp_dedication()}
				</p>
				<div class="il-motion flex flex-wrap justify-center gap-2.5" style:animation={doneRise(4)}>
					<button
						type="button"
						onclick={again}
						class="cursor-pointer rounded-full bg-amber px-6 py-[13px] text-sm font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#e6a94e]"
					>
						{m.lamp_again()}
					</button>
					<button
						type="button"
						onclick={onToGarden}
						class="cursor-pointer rounded-full border border-[#f2ebdd]/20 px-6 py-[13px] text-sm font-medium whitespace-nowrap hover:bg-[#f2ebdd]/6"
					>
						{m.lamp_to_garden()}
					</button>
					{#if canShare}
						<button
							type="button"
							onclick={share}
							class="cursor-pointer rounded-full border border-[#f2ebdd]/20 px-6 py-[13px] text-sm font-medium whitespace-nowrap hover:bg-[#f2ebdd]/6"
						>
							{m.lamp_share()}
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<div
		class="relative flex min-w-0 flex-col items-center gap-[22px] py-5 text-center {phase === 'lit'
			? 'order-first flex-[1_1_100%]'
			: 'flex-[1_1_320px]'}"
	>
		<div bind:this={hero} class="will-change-transform">
			<LampVessel
				type={current ? lampType(current.lamp_type) : LAMP_TYPES[type]}
				mode={phase === 'form' ? 'off' : phase === 'igniting' ? 'igniting' : 'lit'}
			/>
		</div>
		<div
			class="il-motion"
			aria-live="polite"
			style:animation={phase === 'lit'
				? doneRise(2)
				: returned
					? `il-rise1 .7s ${EASE} .2s both`
					: undefined}
		>
			{#if current}
				<p
					class="mb-2.5 inline-block rounded-full bg-amber-light/12 px-[11px] py-1 text-[11px] font-semibold tracking-[.06em] text-[#e8b061]"
				>
					{lampType(current.lamp_type).name()}
				</p>
			{/if}
			<p class="font-serif text-[22px] font-medium">{caption}</p>
			{#if current}
				<p class="mt-2 text-[13px] text-[#e8b061]">{until}</p>
				{#if current.prayer}
					<blockquote
						class="mt-3 max-w-[340px] font-serif text-lg/[1.6] text-pretty text-[#f2ebdd]/70 italic"
					>
						“{current.prayer}”
					</blockquote>
				{/if}
			{/if}
		</div>
	</div>
</section>
