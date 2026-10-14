<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import {
		DEFAULT_LAMP_DAYS,
		LAMP_DAYS,
		LAMP_PURPOSES,
		LAMP_TYPES,
		PRAYER_MAX,
		RECIPIENT_MAX,
		lampPurpose,
		lampType
	} from '$lib/content/lamps';
	import { lampErrorMessage } from '$lib/features/lamp/errors';
	import type { LampError } from '$lib/features/lamp/types';
	import { lamps } from '$lib/state/lamps.svelte';
	import type { Lamp, LampDuration } from '$lib/types/lamp';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		/** Guests can fill the form, but lighting needs an account. */
		isGuest: boolean;
	}

	let { isGuest }: Props = $props();

	const IGNITE_MS = 2100;
	const HERO_MOVE_MS = 950;
	const EASE = 'cubic-bezier(.2,.8,.2,1)';
	const dateFormat = new Intl.DateTimeFormat(getLocale(), {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	});

	let type = $state(0);
	let purpose = $state(0);
	let name = $state('');
	let wish = $state('');
	let days = $state<LampDuration>(DEFAULT_LAMP_DAYS);
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

	const caption = $derived(
		current
			? m.lamp_caption_for({
					purpose: lampPurpose(current.intention).name(),
					name: current.recipient
				})
			: m.lamp_caption_idle()
	);
	const until = $derived(
		current
			? m.lamp_until({
					date: dateFormat.format(new Date(current.end_at)),
					days: current.duration_days
				})
			: ''
	);
	const templeHref = $derived(
		localizeHref(`/offer?purpose=lamp&wish=${encodeURIComponent(current?.prayer || caption)}`)
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

	const light: SubmitFunction = ({ cancel }) => {
		if (phase !== 'form') return cancel();
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
			lamps.add(lamp.id, lamp.end_at);
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
						maxlength={RECIPIENT_MAX}
						placeholder={m.lamp_field_for_placeholder()}
						class={field}
					/>
				</div>

				<div class="il-motion" style:animation={formRise(4)}>
					<label for="lamp-wish" class={label}>{m.lamp_field_wish()}</label>
					<textarea
						id="lamp-wish"
						name="prayer"
						bind:value={wish}
						maxlength={PRAYER_MAX}
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

				{#if error}
					<p class="text-[13px] text-[#f0a49e]" role="alert">{lampErrorMessage(error)}</p>
				{/if}

				{#if isGuest}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a
						href={localizeHref('/login')}
						style:animation={formRise(6)}
						class="il-motion self-start rounded-full bg-amber px-[34px] py-[15px] text-[15px] font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#e6a94e]"
					>
						{m.lamp_login()}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{:else}
					<button
						type="submit"
						disabled={phase === 'igniting'}
						style:animation={formRise(6)}
						class="il-motion cursor-pointer self-start rounded-full bg-amber px-[34px] py-[15px] text-[15px] font-medium whitespace-nowrap text-[#1a1611] transition-opacity hover:bg-[#e6a94e] disabled:opacity-60"
					>
						{phase === 'igniting' ? m.lamp_lighting() : m.lamp_light()}
					</button>
				{/if}
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
				<aside
					class="il-motion mt-1.5 flex max-w-[460px] flex-wrap items-center gap-4 rounded-[20px] border border-amber-light/30 bg-amber-light/8 px-5 py-[18px] text-start"
					style:animation={doneRise(5)}
				>
					<div class="min-w-[200px] flex-1">
						<h2 class="text-sm font-medium text-amber-light">{m.lamp_temple_title()}</h2>
						<p class="mt-1 text-xs/[1.55] text-[#f2ebdd]/65">{m.lamp_temple_desc()}</p>
					</div>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
					<a
						href={templeHref}
						class="rounded-full bg-amber-light px-[18px] py-[11px] text-[13px] font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#f7d38f]"
					>
						{m.lamp_temple_cta()}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</aside>
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
