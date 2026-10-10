<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { msg } from '$lib/utils/msg';
	import { branchHours, chiName, goodHourBranches } from '$lib/utils/lunar';
	import {
		ELEMENT_COLOR,
		ZODIAC,
		dayAlmanac,
		dayClash,
		dayDirections,
		type Direction
	} from '$lib/utils/almanac';

	interface Props {
		date: Date;
	}

	let { date }: Props = $props();

	const view = $derived.by(() => {
		const al = dayAlmanac(date);
		const dirs = dayDirections(date);
		const clash = dayClash(date);
		const dirName = (d: Direction) => msg(`dir_${d}`);
		const elem = (key: string, name: string, element: keyof typeof ELEMENT_COLOR) => ({
			key,
			name,
			label: msg(`element_${element}`),
			color: ELEMENT_COLOR[element]
		});
		return {
			hours: goodHourBranches(date).map((b) => {
				const { from, to } = branchHours(b);
				return { chi: chiName(b), zodiac: ZODIAC[b], range: m.lunar_hour_range({ from, to }) };
			}),
			good: al.good.map((s) => msg(`act_${s}`)),
			bad: al.bad.map((s) => msg(`act_${s}`)),
			dirs: [
				{
					key: 'joy',
					glyph: '喜',
					title: m.day_dir_joy(),
					value: dirName(dirs.joy),
					sub: m.day_dir_joy_sub(),
					tone: '#9A5F58',
					bg: 'rgba(194,133,127,.12)',
					bd: 'rgba(194,133,127,.35)'
				},
				{
					key: 'wealth',
					glyph: '財',
					title: m.day_dir_wealth(),
					value: dirName(dirs.wealth),
					sub: m.day_dir_wealth_sub(),
					tone: '#8A5A18',
					bg: 'rgba(217,150,60,.16)',
					bd: 'rgba(184,134,47,.4)'
				},
				{
					key: 'crane',
					glyph: '鶴',
					title: m.day_dir_crane(),
					value: dirs.crane ? dirName(dirs.crane) : m.day_dir_crane_heaven(),
					sub: dirs.crane ? m.day_dir_crane_sub() : m.day_dir_crane_heaven_sub(),
					tone: '#4E5B66',
					bg: 'rgba(78,91,102,.1)',
					bd: 'rgba(78,91,102,.3)'
				}
			],
			napam: {
				line: m.day_napam_line({
					name: msg(`napam_${al.napamIndex}`),
					gloss: msg(`napam_${al.napamIndex}_gloss`)
				}),
				color: ELEMENT_COLOR[al.napamElement]
			},
			elements: [
				elem(m.day_elem_stem(), al.can, al.canElement),
				elem(m.day_elem_branch(), al.chi, al.chiElement),
				elem(m.day_elem_napam(), msg(`napam_${al.napamIndex}`), al.napamElement)
			],
			clash: {
				names: clash.names.map((name) => ({ name, zodiac: clash.zodiac })),
				note: m.day_clash_note({ day: clash.day, branch: clash.branch })
			}
		};
	});

	const card = 'rounded-[22px] border border-ink/8 bg-paper';
	const heading = 'mb-3 text-[15px] font-medium';
</script>

<div class="flex flex-col gap-7">
	<section aria-labelledby="day-hours">
		<h2 id="day-hours" class={heading}>{m.lunar_good_hours()}</h2>
		<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-2.5">
			{#each view.hours as h (h.chi)}
				<li class="{card} px-2.5 pt-4 pb-3.5 text-center">
					<p class="text-2xl/none" aria-hidden="true">{h.zodiac}</p>
					<p class="mt-2 font-serif text-[22px] font-medium">{h.chi}</p>
					<p class="mt-[3px] text-xs text-ink/55">{h.range}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="day-todo">
		<h2 id="day-todo" class={heading}>{m.day_todo_title()}</h2>
		<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-stretch gap-5">
			<div class="rounded-[22px] border border-[#5e8a6c]/28 bg-[#5e8a6c]/10 px-[22px] py-5">
				<h3 class="text-[10.5px] font-semibold tracking-[.12em] text-[#4e7a5e] uppercase">
					{m.day_do()}
				</h3>
				<ul class="mt-3 flex flex-col gap-2 text-sm/normal">
					{#each view.good as item (item)}
						<li><span aria-hidden="true">✓</span> {item}</li>
					{/each}
				</ul>
			</div>
			<div class="rounded-[22px] border border-[#c64545]/24 bg-[#c64545]/8 px-[22px] py-5">
				<h3 class="text-[10.5px] font-semibold tracking-[.12em] text-[#b04545] uppercase">
					{m.day_dont()}
				</h3>
				<ul class="mt-3 flex flex-col gap-2 text-sm/normal">
					{#each view.bad as item (item)}
						<li><span aria-hidden="true">✕</span> {item}</li>
					{/each}
				</ul>
			</div>
		</div>
		<p class="mt-2.5 text-xs/[1.55] text-pretty text-ink/55">{m.day_todo_note()}</p>
	</section>

	<section aria-labelledby="day-dirs">
		<h2 id="day-dirs" class={heading}>{m.day_dirs_title()}</h2>
		<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-2.5">
			{#each view.dirs as d (d.key)}
				<li class="{card} flex items-start gap-3.5 px-5 py-[18px]">
					<span
						class="flex size-[42px] flex-none items-center justify-center rounded-xl border text-xl/none"
						style:color={d.tone}
						style:background={d.bg}
						style:border-color={d.bd}
						aria-hidden="true"
					>
						{d.glyph}
					</span>
					<div class="min-w-0">
						<p class="text-[13px] font-medium text-ink/60">{d.title}</p>
						<p class="mt-0.5 font-serif text-[22px] font-medium">{d.value}</p>
						<p class="mt-[3px] text-xs/normal text-pretty text-ink/55">{d.sub}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-stretch gap-5">
		<section class="flex flex-col" aria-labelledby="day-elements">
			<h2 id="day-elements" class={heading}>{m.day_elements_title()}</h2>
			<div class="{card} flex-1 p-5">
				<p class="font-serif text-[22px] font-medium" style:color={view.napam.color}>
					{view.napam.line}
				</p>
				<ul class="mt-3.5 grid grid-cols-3 gap-2">
					{#each view.elements as e (e.key)}
						<li class="min-w-0 rounded-[14px] border border-ink/8 px-2 py-3 text-center">
							<p class="text-xs text-ink/45">{e.key}</p>
							<p class="mt-1 font-serif text-lg/[1.3] font-medium">{e.name}</p>
							<p
								class="mt-1.5 inline-flex items-center gap-[5px] text-xs font-medium"
								style:color={e.color}
							>
								<span class="size-[7px] rounded-full" style:background={e.color} aria-hidden="true"
								></span>
								{e.label}
							</p>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<section class="flex flex-col" aria-labelledby="day-clash">
			<h2 id="day-clash" class={heading}>{m.day_clash_title()}</h2>
			<div class="{card} flex-1 p-5">
				<ul class="flex flex-wrap gap-2">
					{#each view.clash.names as c (c.name)}
						<li
							class="flex items-center gap-2 rounded-full border border-[#c2857f]/35 bg-[#c2857f]/12 py-[7px] pr-3.5 pl-2.5 text-[13px] font-medium text-[#9a5f58]"
						>
							<span class="text-[17px]/none" aria-hidden="true">{c.zodiac}</span>
							<span>{c.name}</span>
						</li>
					{/each}
				</ul>
				<p class="mt-3 text-[13px]/[1.6] text-pretty text-ink/58">{view.clash.note}</p>
			</div>
		</section>
	</div>
</div>
