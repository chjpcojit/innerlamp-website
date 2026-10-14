<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { SANGHA_BOARD, SANGHA_NOTES, SANGHA_PROFILE } from '$lib/content/sangha';

	interface Props {
		fullName?: string;
		/** Pháp danh; preferred as the headline when set. */
		dharmaName?: string;
		/** Session display name, used when the profile could not be loaded. */
		fallbackName: string;
	}

	let { fullName, dharmaName, fallbackName }: Props = $props();

	const name = $derived(dharmaName || fullName || fallbackName);
	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(-2)
			.map((w) => w[0])
			.join('')
			.toUpperCase()
	);

	/** Placeholder until live presence is served by the backend. */
	const SITTING_NOW = 23;
</script>

<aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
	<section class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]">
		<h2 class="text-[10px] font-semibold tracking-[.14em] text-ink/42">{m.sg_profile_kicker()}</h2>
		<div class="mt-3.5 flex items-center gap-3.5">
			<div
				class="flex size-12 flex-none items-center justify-center rounded-full bg-sand-deep font-serif text-[17px] font-semibold text-gold-deep"
				aria-hidden="true"
			>
				{initials || '·'}
			</div>
			<div>
				<p class="font-serif text-[22px]/tight">{name}</p>
				{#if dharmaName && fullName}
					<p class="mt-0.5 text-[12.5px] text-ink/50">{fullName}</p>
				{/if}
			</div>
		</div>
		<dl class="mt-3.5">
			{#each SANGHA_PROFILE as r (r.label())}
				<div class="flex justify-between gap-3 border-t border-ink/7 py-2.5 text-[13px]">
					<dt class="text-ink/52">{r.label()}</dt>
					<dd class="text-end font-medium">{r.value()}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section
		data-keep-dark
		class="relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#2a2620,#161310)] p-6 text-[#f5eee0]"
	>
		<div
			class="pointer-events-none absolute -top-[50px] -right-[50px] size-[200px] rounded-full bg-[radial-gradient(circle,rgba(217,150,60,.3),transparent_66%)]"
		></div>
		<h2 class="relative text-[10px] font-semibold tracking-[.16em] text-[#e8b061]">
			{m.sg_sitting_kicker()}
		</h2>
		<p class="relative mt-2.5 font-serif text-[42px]">
			{SITTING_NOW} <span class="text-base text-[#f2ebdd]/60">{m.sg_sitting_people()}</span>
		</p>
		<p class="relative mt-1 text-[12.5px] text-[#f2ebdd]/60">{m.sg_sitting_meta()}</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a
			href={localizeHref('/practice/meditate')}
			class="relative mt-[18px] inline-block rounded-full bg-amber px-5 py-[11px] text-[13.5px] font-medium text-[#1a1611] transition-colors hover:bg-amber-light"
		>
			{m.sg_sitting_join()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</section>

	<section class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]">
		<h2 class="text-[10px] font-semibold tracking-[.14em] text-ink/42">{m.sg_notes_kicker()}</h2>
		<ul class="mt-3.5 flex flex-col gap-3.5">
			{#each SANGHA_NOTES as n (n.text())}
				<li>
					<p class="text-[13.5px]/normal font-medium text-pretty">{n.text()}</p>
					<p class="mt-[3px] text-xs text-ink/50">{n.by()}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]">
		<h2 class="text-[10px] font-semibold tracking-[.14em] text-ink/42">{m.sg_board_kicker()}</h2>
		<dl class="mt-2.5">
			{#each SANGHA_BOARD as r (r.role())}
				<div class="border-b border-ink/7 py-2.5 last:border-b-0">
					<dt class="text-xs text-ink/50">{r.role()}</dt>
					<dd class="mt-0.5 text-sm font-medium">{r.name()}</dd>
				</div>
			{/each}
		</dl>
		<p class="mt-3 text-[12.5px]/normal text-ink/60">{m.sg_office_hours()}</p>
	</section>
</aside>
