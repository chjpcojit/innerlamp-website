<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import StepCard from '$lib/components/ui/StepCard.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import {
		CUSTOM_AMOUNT,
		FALLBACK_CAMPAIGN,
		OFFER_AMOUNTS,
		OFFER_CAMPAIGNS,
		OFFER_PURPOSES,
		OFFER_TEMPLES,
		RESTORE_PURPOSE_INDEX
	} from '$lib/content/offer';
	import type { OfferFlow } from '$lib/state/offer.svelte';
	import { formatVnd } from '$lib/utils/money';

	interface Props {
		flow: OfferFlow;
	}

	let { flow }: Props = $props();

	const locale = getLocale();
	const purpose = $derived(OFFER_PURPOSES[flow.purpose]);
	const campaign = $derived(
		flow.purpose === RESTORE_PURPOSE_INDEX
			? (OFFER_CAMPAIGNS[flow.temple] ?? FALLBACK_CAMPAIGN)
			: null
	);
	const summary = $derived([
		{ k: m.offer_sum_temple(), v: flow.templeInfo.name() },
		{ k: m.offer_sum_purpose(), v: purpose.label() },
		{ k: m.offer_sum_donor(), v: flow.anonymous ? m.offer_anonymous() : flow.name || '—' },
		{
			k: m.offer_sum_monthly(),
			v: flow.monthly ? m.offer_sum_monthly_yes() : m.offer_sum_monthly_no()
		}
	]);
	const amountLabel = $derived(flow.amount ? formatVnd(flow.amount, locale) : '—');

	function onCustomInput(e: Event & { currentTarget: HTMLInputElement }) {
		const digits = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
		flow.custom = digits ? Number(digits).toLocaleString(locale) : '';
	}

	const chip =
		'cursor-pointer rounded-full border px-4 py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink/72 hover:bg-white';
	const label = 'mb-1.5 block text-xs font-medium text-ink/55';
	const input =
		'h-[46px] w-full rounded-[14px] border border-ink/12 bg-paper px-3.5 text-base text-ink outline-none focus:border-gold';
</script>

<form
	class="flex flex-wrap items-start gap-6"
	onsubmit={(e) => {
		e.preventDefault();
		flow.next();
	}}
>
	<div class="flex min-w-0 flex-[1.6_1_460px] flex-col gap-[18px]">
		<StepCard step={1} title={m.offer_step_temple()}>
			<fieldset>
				<legend class="sr-only">{m.offer_step_temple()}</legend>
				<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-2.5">
					{#each OFFER_TEMPLES as t, i (t.slug)}
						<label
							class="flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-3 {flow.temple ===
							i
								? 'border-gold bg-gold/6'
								: 'border-ink/10 bg-paper'}"
						>
							<input
								type="radio"
								name="temple"
								value={i}
								bind:group={flow.temple}
								class="sr-only"
							/>
							<Icon kind="temple" tone="#8A5A18" tint="#efe6d5" size={44} />
							<span class="min-w-0 flex-1">
								<span class="flex items-center gap-1.5">
									<span class="truncate text-sm font-medium">{t.name()}</span>
									<span
										class="flex size-3.5 flex-none items-center justify-center rounded-full bg-[#6e8f7a]"
										title={m.offer_verified()}
									>
										<span class="sr-only">{m.offer_verified()}</span>
										<span
											class="h-1.5 w-[3px] -translate-y-px rotate-45 border-r-[1.5px] border-b-[1.5px] border-white"
											aria-hidden="true"
										></span>
									</span>
								</span>
								<span class="mt-0.5 block text-xs text-ink/52">{t.sub()}</span>
							</span>
						</label>
					{/each}
				</div>
			</fieldset>
		</StepCard>

		<StepCard step={2} title={m.offer_step_purpose()}>
			<div class="flex flex-wrap gap-2" role="group" aria-label={m.offer_step_purpose()}>
				{#each OFFER_PURPOSES as p, i (p.slug)}
					<button
						type="button"
						aria-pressed={flow.purpose === i}
						onclick={() => (flow.purpose = i)}
						class="{chip} {flow.purpose === i ? chipOn : chipOff}"
					>
						{p.label()}
					</button>
				{/each}
			</div>
			<p class="mt-3 text-[13px]/relaxed text-pretty text-ink/60">{purpose.note()}</p>
			{#if campaign}
				<div class="mt-3.5 rounded-2xl bg-cream px-[18px] py-4">
					<div class="flex flex-wrap justify-between gap-3">
						<p class="text-sm font-medium">{campaign.name()}</p>
						<p class="text-xs text-ink/55">{m.offer_camp_left({ days: campaign.daysLeft })}</p>
					</div>
					<div
						class="mt-3 h-2 overflow-hidden rounded-full bg-ink/8"
						role="progressbar"
						aria-label={campaign.name()}
						aria-valuenow={campaign.percent}
						aria-valuemin="0"
						aria-valuemax="100"
					>
						<div class="h-full rounded-full bg-gold" style:width="{campaign.percent}%"></div>
					</div>
					<p class="mt-2 text-xs text-ink/60">
						{m.offer_camp_line({
							received: campaign.received,
							goal: campaign.goal,
							offerings: campaign.offerings.toLocaleString(locale)
						})}
					</p>
				</div>
			{/if}
		</StepCard>

		<StepCard step={3} title={m.offer_step_amount()}>
			<div
				class="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2"
				role="group"
				aria-label={m.offer_step_amount()}
			>
				{#each OFFER_AMOUNTS as a (a)}
					<button
						type="button"
						aria-pressed={flow.preset === a}
						onclick={() => (flow.preset = a)}
						class="cursor-pointer rounded-[14px] border px-2 py-3.5 text-center text-[15px] font-medium transition-colors {flow.preset ===
						a
							? chipOn
							: chipOff}"
					>
						{a === CUSTOM_AMOUNT ? m.offer_amount_custom() : formatVnd(a, locale)}
					</button>
				{/each}
			</div>
			{#if flow.preset === CUSTOM_AMOUNT}
				<div class="relative mt-3">
					<label for="offer-custom" class="sr-only">{m.offer_amount_custom_placeholder()}</label>
					<input
						id="offer-custom"
						value={flow.custom}
						oninput={onCustomInput}
						inputmode="numeric"
						placeholder={m.offer_amount_custom_placeholder()}
						class="{input} pe-10"
					/>
					<span
						class="pointer-events-none absolute end-4 top-[13px] text-[15px] font-medium text-ink/45"
						>đ</span
					>
				</div>
			{/if}
			<p class="mt-2.5 text-xs text-ink/50">{m.offer_amount_hint()}</p>
		</StepCard>

		<StepCard step={4} title={m.offer_step_donor()} class="flex flex-col gap-3.5">
			<div>
				<label for="offer-name" class={label}>{m.offer_field_name()}</label>
				<input
					id="offer-name"
					bind:value={flow.name}
					disabled={flow.anonymous}
					placeholder={m.offer_field_name_placeholder()}
					class="{input} {flow.anonymous ? 'opacity-45' : ''}"
				/>
			</div>
			<div class="flex items-center gap-3.5">
				<div class="flex-1">
					<p class="text-sm font-medium">{m.offer_anonymous()}</p>
					<p class="mt-0.5 text-xs text-ink/52">{m.offer_anonymous_hint()}</p>
				</div>
				<Toggle
					checked={flow.anonymous}
					label={m.offer_anonymous()}
					onchange={(v) => (flow.anonymous = v)}
				/>
			</div>
			<div>
				<label for="offer-wish" class={label}>{m.offer_field_wish()}</label>
				<textarea
					id="offer-wish"
					bind:value={flow.wish}
					placeholder={m.offer_field_wish_placeholder()}
					class="h-24 w-full resize-y rounded-[14px] border border-ink/12 bg-paper px-3.5 py-3 text-sm/relaxed text-ink outline-none focus:border-gold"
				></textarea>
			</div>
			<div class="flex items-center gap-3.5 border-t border-ink/7 pt-3.5">
				<div class="flex-1">
					<p class="text-sm font-medium">{m.offer_monthly()}</p>
					<p class="mt-0.5 text-xs text-ink/52">{m.offer_monthly_hint()}</p>
				</div>
				<Toggle
					checked={flow.monthly}
					label={m.offer_monthly()}
					onchange={(v) => (flow.monthly = v)}
				/>
			</div>
		</StepCard>
	</div>

	<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 lg:sticky lg:top-28">
		<section
			data-keep-dark
			aria-labelledby="offer-summary"
			class="relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#2a2620,#161310)] p-6 text-[#f5eee0]"
		>
			<div
				class="pointer-events-none absolute -top-[60px] -right-[60px] size-[200px] rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.3),transparent_66%)]"
			></div>
			<h2
				id="offer-summary"
				class="relative text-[10.5px] font-semibold tracking-[.16em] text-[#e8b061] uppercase"
			>
				{m.offer_summary()}
			</h2>
			<p class="relative mt-2.5 font-serif text-[40px] font-medium">{amountLabel}</p>
			<dl class="relative mt-3 flex flex-col">
				{#each summary as r (r.k)}
					<div class="flex justify-between gap-3 border-t border-[#f2ebdd]/10 py-[9px] text-[13px]">
						<dt class="text-[#f2ebdd]/60">{r.k}</dt>
						<dd class="text-end font-medium">{r.v}</dd>
					</div>
				{/each}
			</dl>
			{#if flow.error}
				<p role="alert" class="relative mt-3 text-xs font-medium text-[#f0a89e]">
					{flow.error === 'amount' ? m.offer_err_amount() : m.offer_err_name()}
				</p>
			{/if}
			<button
				type="submit"
				class="relative mt-[18px] w-full cursor-pointer rounded-full bg-amber py-3.5 text-sm font-medium text-[#1a1611] transition-colors hover:bg-[#e6a94e]"
			>
				{m.offer_create_code()}
			</button>
		</section>
		<p
			class="rounded-[22px] border border-ink/8 bg-paper px-[18px] py-4 text-xs/[1.6] text-pretty text-ink/60"
		>
			{m.offer_verified_note()}
		</p>
	</aside>
</form>
