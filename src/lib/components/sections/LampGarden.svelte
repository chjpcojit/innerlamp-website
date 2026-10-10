<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import {
		LAMP_BASE_COUNT,
		LAMP_PURPOSES,
		LAMP_TYPES,
		WALL_LAMPS,
		WALL_PAGE_SIZE
	} from '$lib/content/lamps';
	import { daysLeft, lamps } from '$lib/state/lamps.svelte';

	/** `null` shows every type. */
	let filter = $state<number | null>(null);
	let limit = $state(WALL_PAGE_SIZE);

	interface Tile {
		id: string;
		who: string;
		purpose: string;
		to: string;
		left: string;
		type: number;
		mine: boolean;
		atTemple: boolean;
	}

	const all = $derived<Tile[]>([
		...lamps.active.map((l) => ({
			id: l.id,
			who: m.lamp_wall_you(),
			purpose: LAMP_PURPOSES[l.purpose](),
			to: l.name ? m.lamp_to_person({ name: l.name }) : m.lamp_to_all(),
			left: m.lamp_days_left({ count: daysLeft(l) }),
			type: l.type,
			mine: true,
			atTemple: false
		})),
		...WALL_LAMPS.map((w, i) => ({
			id: `wall-${i}`,
			who: w.who,
			purpose: LAMP_PURPOSES[w.purpose](),
			to: w.to(),
			left: m.lamp_days_left({ count: w.daysLeft }),
			type: w.type,
			mine: false,
			atTemple: w.atTemple
		}))
	]);

	const filtered = $derived(filter === null ? all : all.filter((t) => t.type === filter));
	const visible = $derived(filtered.slice(0, limit));
	const count = $derived((LAMP_BASE_COUNT + lamps.active.length).toLocaleString(getLocale()));

	const tabs = $derived([
		{ id: null, label: m.lamp_wall_all(), n: all.length },
		...LAMP_TYPES.map((t, i) => ({
			id: i,
			label: t.name(),
			n: all.filter((x) => x.type === i).length
		}))
	]);

	function pick(id: number | null) {
		filter = id;
		limit = WALL_PAGE_SIZE;
	}

	const chip =
		'flex cursor-pointer gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors';
</script>

<section
	data-keep-dark
	aria-labelledby="lamp-garden"
	class="rounded-[28px] bg-[#14110d] p-[clamp(22px,3vw,36px)] text-[#f5eee0]"
>
	<div class="mb-5 flex flex-wrap items-baseline justify-between gap-3">
		<h2 id="lamp-garden" class="font-serif text-[28px] font-medium">{m.lamp_wall_title()}</h2>
		<p class="text-[13px] text-[#f2ebdd]/55">{m.lamp_wall_count({ count })}</p>
	</div>

	<div class="mb-[18px] flex flex-wrap gap-2" role="group" aria-label={m.lamp_wall_filter()}>
		{#each tabs as t (t.id)}
			<button
				type="button"
				aria-pressed={filter === t.id}
				onclick={() => pick(t.id)}
				class="{chip} {filter === t.id
					? 'border-amber-light bg-amber-light text-[#1a1611]'
					: 'border-[#f2ebdd]/14 bg-[#f2ebdd]/5 text-[#f2ebdd] hover:bg-[#f2ebdd]/10'}"
			>
				{t.label}<span class="opacity-60">{t.n}</span>
			</button>
		{/each}
	</div>

	<ul class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
		{#each visible as w (w.id)}
			<li
				class="flex h-52 min-w-0 flex-col items-center rounded-[18px] border px-3.5 pt-4 pb-3.5 text-center {w.mine
					? 'border-amber-light/50 bg-amber-light/8'
					: 'border-[#f2ebdd]/8 bg-[#f2ebdd]/4'}"
			>
				<LampVessel type={LAMP_TYPES[w.type]} mode="lit" size="mini" />
				<div class="mt-2.5 flex flex-wrap justify-center gap-1">
					<span
						class="rounded-full bg-amber-light/12 px-[9px] py-[3px] text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap text-[#e8b061]"
					>
						{LAMP_TYPES[w.type].name()}
					</span>
					{#if w.atTemple}
						<span
							class="rounded-full bg-[#7fa88c]/18 px-[9px] py-[3px] text-[10.5px] font-semibold tracking-[.06em] whitespace-nowrap text-[#a9cdb4]"
						>
							{m.lamp_wall_at_temple()}
						</span>
					{/if}
				</div>
				<p class="mt-2 w-full truncate text-[13px] font-medium">{w.who} · {w.purpose}</p>
				<p class="mt-[3px] w-full truncate text-xs text-[#f2ebdd]/55">{w.to}</p>
				<p class="mt-auto text-xs text-[#e8b061]">{w.left}</p>
			</li>
		{/each}
	</ul>

	{#if filtered.length > limit}
		<div class="mt-[18px] flex justify-center">
			<button
				type="button"
				onclick={() => (limit += WALL_PAGE_SIZE)}
				class="cursor-pointer rounded-full border border-[#f2ebdd]/20 px-5 py-2.5 text-[13px] font-medium text-[#f2ebdd] hover:bg-[#f2ebdd]/6"
			>
				{m.lamp_wall_more()}
			</button>
		</div>
	{/if}
</section>
