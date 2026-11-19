<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		isMemorialFull,
		memorialCountView,
		nextAnniversary,
		showMemorialPhoto,
		sortMemorialEntries
	} from '$lib/utils/memorial';
	import {
		daysLabel,
		deathDateLabel,
		initials,
		longDate,
		nthLabel,
		relationLabel,
		remindLabel
	} from '$lib/utils/memorial-format';
	import type { MemorialEntry, MemorialFlashData } from '$lib/types/memorial';

	interface Props {
		entries: MemorialEntry[] | null;
		total: number;
		loadError: boolean;
		flash: MemorialFlashData | null;
		photoEnabled: boolean;
	}

	let { entries, total, loadError, flash, photoEnabled }: Props = $props();

	/** The device's date; never the server's (BR-MEM-08). Null during SSR and before mount. */
	let today = $state<Date | null>(null);

	onMount(() => {
		today = new Date();
	});

	const items = $derived(
		today && entries
			? sortMemorialEntries(
					entries.map((entry) => ({ entry, next: nextAnniversary(entry, today ?? new Date()) }))
				)
			: []
	);
	const top = $derived(today ? items[0] : undefined);
	const full = $derived(isMemorialFull(total));

	const countText = $derived.by(() => {
		if (!entries) return '';
		const view = memorialCountView(entries.length, total);
		if (view.kind === 'none') return m.mem_none();
		if (view.kind === 'partial')
			return m.mem_count_partial({ shown: view.shown, total: view.total });
		return m.mem_count({ count: view.total });
	});

	const href = (id: number) => resolve(localizeHref(`/memorial/${id}`) as '/memorial/[id]');
	const photoSrc = (id: number) =>
		resolve(localizeHref(`/memorial/${id}/photo`) as '/memorial/[id]/photo');

	const flashText = $derived(
		flash
			? flash.kind === 'gone'
				? m.mem_flash_gone()
				: flash.kind === 'deleted'
					? m.mem_flash_deleted()
					: m.mem_flash_saved()
			: ''
	);

	const points = [
		[() => m.mem_pt_1_title(), () => m.mem_pt_1_desc()],
		[() => m.mem_pt_2_title(), () => m.mem_pt_2_desc()],
		[() => m.mem_pt_3_title(), () => m.mem_pt_3_desc()]
	] as const;
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium">{m.mem_title()}</h1>
			<p class="mt-2 text-sm text-ink/55">{countText}</p>
		</div>
		{#if full}
			<div class="flex flex-col items-end gap-1.5">
				<button
					type="button"
					disabled
					class="cursor-not-allowed rounded-full bg-ink/35 px-[22px] py-3 text-[13px] font-medium text-cream"
				>
					{m.mem_add()}
				</button>
				<p role="status" class="text-xs text-[#a7443f]">{m.mem_err_full()}</p>
			</div>
		{:else}
			<a
				href={resolve(localizeHref('/memorial/new') as '/memorial/new')}
				data-keep-dark
				class="rounded-full bg-ink px-[22px] py-3 text-[13px] font-medium text-cream shadow-[0_8px_24px_rgba(34,30,25,.16)] transition-colors hover:bg-[#3a342c]"
			>
				{m.mem_add()}
			</a>
		{/if}
	</header>

	{#if flashText}
		<p
			role="status"
			class="flex items-center gap-2.5 rounded-[14px] bg-[#6e8f7a]/16 px-4 py-3 text-[13px]/normal"
		>
			<span class="flex size-[18px] flex-none items-center justify-center rounded-full bg-sage">
				<span class="-mt-0.5 h-1 w-[7px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-white"
				></span>
			</span>
			{flashText}
		</p>
	{/if}

	{#if loadError}
		<div class="flex flex-col items-center px-2 pt-5 text-center">
			<h2 class="font-serif text-[28px]/[1.3] font-medium">{m.mem_err_load()}</h2>
			<a
				href={resolve(localizeHref('/memorial') as '/memorial')}
				class="mt-4 rounded-full border border-ink/20 px-5 py-2.5 text-[13.5px] font-medium hover:bg-sand/60"
			>
				{m.mem_retry()}
			</a>
		</div>
	{:else if top}
		<div class="flex flex-wrap items-start gap-6">
			<a
				href={href(top.entry.id)}
				class="min-w-0 flex-[1_1_360px] rounded-3xl border border-gold/30 bg-[#fbf3e4] p-6"
			>
				<p class="text-[10.5px] font-semibold tracking-[.16em] text-[#74500f] uppercase">
					{top.next.days === 0
						? m.mem_top_today()
						: top.next.days === 1
							? m.mem_top_tomorrow()
							: m.mem_top_upcoming({ count: top.next.days })}
				</p>
				<div class="mt-4 flex items-center gap-4">
					{#if showMemorialPhoto(photoEnabled, top.entry.hasPhoto)}
						<img
							src={photoSrc(top.entry.id)}
							alt={top.entry.name}
							referrerpolicy="no-referrer"
							class="size-[76px] flex-none rounded-full object-cover"
						/>
					{:else}
						<span
							class="flex size-[76px] flex-none items-center justify-center rounded-full bg-amber/20 font-serif text-3xl text-gold-deep"
							aria-hidden="true"
						>
							{initials(top.entry.name)}
						</span>
					{/if}
					<div class="min-w-0">
						<h2 class="font-serif text-[28px]/[1.25] font-medium">{top.entry.name}</h2>
						<p class="mt-1 text-[13px] text-ink/60">
							{[relationLabel(top.entry), nthLabel(top.next.nth)].filter(Boolean).join(' · ')}
						</p>
					</div>
				</div>
				<div class="my-[18px] mb-3.5 h-px bg-gold/30"></div>
				<dl class="grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 gap-y-[9px] text-[13px]/normal">
					<dt class="text-ink/55">{m.mem_row_death()}</dt>
					<dd>{deathDateLabel(top.entry)}</dd>
					<dt class="text-ink/55">{m.mem_row_falls_on()}</dt>
					<dd>{longDate(top.next.date)}</dd>
					<dt class="text-ink/55">{m.mem_row_reminder()}</dt>
					<dd>{remindLabel(top.entry)}</dd>
				</dl>
			</a>

			<section class="min-w-0 flex-[1.4_1_440px]" aria-labelledby="mem-upcoming">
				<h2
					id="mem-upcoming"
					class="mb-3 ml-1 text-[10.5px] font-semibold tracking-[.14em] text-ink/42 uppercase"
				>
					{m.mem_upcoming()}
				</h2>
				<ul class="flex flex-col gap-2.5">
					{#each items as { entry, next } (entry.id)}
						<li>
							<a
								href={href(entry.id)}
								class="flex items-center gap-3.5 rounded-[18px] border border-ink/8 bg-paper px-[18px] py-3 transition-colors hover:bg-white"
							>
								{#if showMemorialPhoto(photoEnabled, entry.hasPhoto)}
									<img
										src={photoSrc(entry.id)}
										alt={entry.name}
										referrerpolicy="no-referrer"
										class="size-12 flex-none rounded-full object-cover"
									/>
								{:else}
									<span
										class="flex size-12 flex-none items-center justify-center rounded-full bg-gold/14 font-serif text-xl text-gold-deep"
										aria-hidden="true"
									>
										{initials(entry.name)}
									</span>
								{/if}
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium">{entry.name}</span>
									<span class="mt-0.5 block text-xs text-ink/50">
										{relationLabel(entry)} · {deathDateLabel(entry)}
									</span>
								</span>
								<span class="flex flex-none flex-col items-end gap-1">
									<span
										class="text-xs font-medium whitespace-nowrap {next.days <= 7
											? 'text-gold-deep'
											: 'text-ink/42'}"
									>
										{daysLabel(next.days)}
									</span>
									{#if entry.reminder}
										<span class="text-xs text-ink/42">{m.mem_has_reminder()}</span>
									{/if}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	{:else if entries && !total}
		<div class="flex flex-col items-center px-2 pt-5 text-center">
			<h2 class="font-serif text-[28px]/[1.3] font-medium">{m.mem_empty_title()}</h2>
			<p class="mt-2 max-w-[360px] text-sm/[1.65] text-pretty text-ink/52">{m.mem_empty_desc()}</p>
		</div>
	{/if}

	<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">
		{#each points as [title, desc], i (i)}
			<li
				class="flex items-start gap-3.5 rounded-[20px] border border-ink/8 bg-paper px-[18px] py-4"
			>
				<span
					class="flex size-[26px] flex-none items-center justify-center rounded-full bg-gold/14 text-xs font-semibold text-gold"
					aria-hidden="true"
				>
					{i + 1}
				</span>
				<div class="min-w-0">
					<h3 class="text-sm font-medium">{title()}</h3>
					<p class="mt-[3px] text-xs/[1.55] text-pretty text-ink/55">{desc()}</p>
				</div>
			</li>
		{/each}
	</ul>
</div>
