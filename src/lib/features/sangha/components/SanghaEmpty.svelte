<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { templeSectLabel } from '$lib/utils/temple-labels';
	import type { TempleSummary } from '$lib/types/temple';
	import { sanghaErrorMessage } from '../errors';
	import type { SanghaError } from '../types';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		/** Featured temples offered as a first pick; the block is hidden when empty. */
		suggestions: TempleSummary[];
	}

	let { suggestions }: Props = $props();

	let pendingId = $state<string | null>(null);
	let error = $state<{ id: string; code: SanghaError } | null>(null);

	const choose =
		(id: string): SubmitFunction =>
		() => {
			pendingId = id;
			error = null;
			return async ({ result, update }) => {
				pendingId = null;
				if (result.type === 'failure') {
					error = { id, code: (result.data?.sanghaError as SanghaError | undefined) ?? 'failed' };
					return;
				}
				await update();
			};
		};

	const PERKS = [
		{ title: () => m.sg_perk_1_title(), desc: () => m.sg_perk_1_desc() },
		{ title: () => m.sg_perk_2_title(), desc: () => m.sg_perk_2_desc() },
		{ title: () => m.sg_perk_3_title(), desc: () => m.sg_perk_3_desc() },
		{ title: () => m.sg_perk_4_title(), desc: () => m.sg_perk_4_desc() }
	];

	const smallButton =
		'rounded-full px-4 py-[9px] text-xs font-medium whitespace-nowrap transition-colors';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<div class="flex flex-col gap-7">
	<section
		aria-labelledby="sg-title"
		class="relative flex flex-col items-start gap-3 overflow-hidden rounded-[28px] bg-sand px-[clamp(22px,4vw,44px)] py-[clamp(28px,5vw,52px)]"
	>
		<div
			class="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.22),transparent_70%)]"
			aria-hidden="true"
		></div>
		<Icon kind="temple" size={48} />
		<p class="text-[10.5px] font-semibold tracking-[.18em] text-gold-deep">{m.sg_kicker()}</p>
		<h1 id="sg-title" class="font-serif text-[clamp(36px,7vw,52px)]/[1.1] font-medium">
			{m.sg_none_title()}
		</h1>
		<p class="max-w-[560px] text-[15px]/relaxed text-pretty text-ink/65">{m.sg_none_desc()}</p>
		<a
			href={localizeHref('/temples')}
			class="mt-2 rounded-full bg-ink px-[18px] py-[11px] text-[13px] font-medium text-cream transition-colors hover:bg-[#3a332b]"
		>
			{m.sg_none_find()}
		</a>
	</section>

	<div class="flex flex-wrap items-start gap-7">
		{#if suggestions.length}
			<section aria-labelledby="sg-suggest" class="flex min-w-0 flex-[2_1_520px] flex-col gap-3.5">
				<div class="flex items-baseline justify-between gap-3">
					<h2 id="sg-suggest" class="font-serif text-[22px] font-medium">{m.sg_suggest_title()}</h2>
					<a
						href={localizeHref('/temples')}
						class="text-[13px] font-medium whitespace-nowrap text-gold-deep hover:text-ink"
					>
						{m.sg_suggest_all()} <span aria-hidden="true">›</span>
					</a>
				</div>
				<ul class="flex flex-col gap-3.5">
					{#each suggestions as t (t.id)}
						{@const sect = templeSectLabel(t.sect)}
						<li
							class="flex flex-wrap items-center gap-4 rounded-[22px] border border-ink/8 bg-paper p-3.5"
						>
							<div
								class="size-[88px] flex-none overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_70%_20%,#4a3b25,#1c1813_70%)]"
							>
								{#if t.thumbnail_url}
									<img src={t.thumbnail_url} alt="" class="size-full object-cover" loading="lazy" />
								{/if}
							</div>
							<div class="min-w-[160px] flex-1">
								<h3 class="font-serif text-[22px]/tight">{t.name}</h3>
								<p class="mt-1 text-xs text-ink/55">
									{[sect, t.location.province].filter(Boolean).join(' · ')}
								</p>
								{#if error?.id === t.id}
									<p class="mt-1.5 text-xs text-[#a7443f]" role="alert">
										{sanghaErrorMessage(error.code)}
									</p>
								{/if}
							</div>
							<form
								method="POST"
								action="?/setSangha"
								use:enhance={choose(t.id)}
								class="flex flex-wrap gap-2"
							>
								<input type="hidden" name="temple_id" value={t.id} />
								<a
									href={localizeHref(`/temples/${encodeURIComponent(t.id)}`)}
									class="{smallButton} border border-ink/14 hover:bg-cream"
								>
									{m.sg_suggest_view()}
								</a>
								<button
									type="submit"
									disabled={pendingId !== null}
									class="{smallButton} cursor-pointer bg-ink text-cream hover:bg-[#3a332b] disabled:opacity-60"
								>
									{m.sg_suggest_choose()}
								</button>
							</form>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
			<section
				aria-labelledby="sg-perks"
				class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
			>
				<h2 id="sg-perks" class="text-[10.5px] font-semibold tracking-[.14em] text-ink/42">
					{m.sg_perks_title()}
				</h2>
				<ul class="mt-3.5 flex flex-col gap-3.5">
					{#each PERKS as p (p.title())}
						<li>
							<p class="text-sm font-medium">{p.title()}</p>
							<p class="mt-0.5 text-xs text-ink/55">{p.desc()}</p>
						</li>
					{/each}
				</ul>
			</section>
			<a
				href={localizeHref('/events')}
				class="flex items-center gap-3.5 rounded-[22px] border border-ink/8 bg-paper px-5 py-4 transition-colors hover:bg-white"
			>
				<Icon kind="calendar" size={44} />
				<span class="min-w-0 flex-1">
					<span class="block text-sm font-medium">{m.sg_events_link_title()}</span>
					<span class="mt-0.5 block text-xs text-ink/55">{m.sg_events_link_desc()}</span>
				</span>
				<span class="text-ink/35" aria-hidden="true">›</span>
			</a>
		</aside>
	</div>
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
