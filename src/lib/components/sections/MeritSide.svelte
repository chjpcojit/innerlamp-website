<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { MERIT_PROGRESS } from '$lib/content/merit';
	import { OFFER_TEMPLES } from '$lib/content/offer';
	import { merit } from '$lib/state/merit.svelte';
	import { formatVnd } from '$lib/utils/money';

	const locale = getLocale();

	const pct = Math.round((MERIT_PROGRESS.received / MERIT_PROGRESS.goal) * 100);
	const card = 'rounded-[22px] border border-ink/8 bg-paper px-[22px] py-5';
	const eyebrow = 'text-[10.5px] font-semibold tracking-[.14em] uppercase';
</script>

<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
	<h2 class="font-serif text-[22px] font-medium">{m.mr_letter_title()}</h2>
	<blockquote class="rounded-[22px] border border-gold/30 bg-[#fbf3e4] px-6 py-[22px]">
		<p class="{eyebrow} text-gold-deep">{m.mr_letter_from()}</p>
		<p class="mt-2.5 font-serif text-lg/[1.6] text-pretty italic">{m.mr_letter_body()}</p>
		<footer class="mt-3 text-xs font-medium text-ink/60">{m.mr_letter_sign()}</footer>
	</blockquote>

	<section class={card}>
		<h3 class="{eyebrow} text-ink/45">{m.mr_monthly_title()}</h3>
		{#if merit.monthly}
			<div class="mt-2.5 flex items-center gap-3">
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium">
						{OFFER_TEMPLES[merit.monthly.temple].name()} · {formatVnd(merit.monthly.amount, locale)}
					</p>
					<p class="mt-0.5 text-xs text-ink/55">{m.mr_monthly_active()}</p>
				</div>
				<button
					type="button"
					onclick={() => merit.stopMonthly()}
					class="cursor-pointer rounded-full border border-ink/14 px-[13px] py-[7px] text-xs font-medium whitespace-nowrap hover:bg-sand/60"
				>
					{m.mr_monthly_stop()}
				</button>
			</div>
		{:else}
			<p class="mt-2.5 text-[13px]/relaxed text-ink/60">{m.mr_monthly_empty()}</p>
		{/if}
	</section>

	<section class={card}>
		<h3 class="{eyebrow} text-ink/45">{m.mr_public_title()}</h3>
		<p class="mt-2.5 text-sm font-medium">{m.mr_public_project()}</p>
		<div
			class="mt-2.5 h-2 overflow-hidden rounded-full bg-ink/8"
			role="progressbar"
			aria-label={m.mr_public_project()}
			aria-valuenow={pct}
			aria-valuemin="0"
			aria-valuemax="100"
		>
			<div class="h-full rounded-full bg-gold" style:width="{pct}%"></div>
		</div>
		<p class="mt-2 text-xs/[1.55] text-ink/60">
			{m.mr_public_desc({
				received: MERIT_PROGRESS.received,
				goal: MERIT_PROGRESS.goal,
				offerings: MERIT_PROGRESS.offerings,
				spent: MERIT_PROGRESS.spent
			})}
		</p>
	</section>
</aside>
