<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import {
		REGISTERED_EVENT_IDS,
		SANGHA_EVENTS,
		SANGHA_POSTS,
		SANGHA_SCHEDULE
	} from '$lib/content/sangha';

	const locale = getLocale();
	const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' });

	let registered = $state<string[]>([...REGISTERED_EVENT_IDS]);
	let liked = $state<number[]>([]);

	const toggle = <T,>(list: T[], v: T) =>
		list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
</script>

<div class="flex min-w-0 flex-[2_1_520px] flex-col gap-7">
	<section
		aria-labelledby="sg-upcoming"
		class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
	>
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<h2 id="sg-upcoming" class="font-serif text-2xl">{m.sg_upcoming_title()}</h2>
			<p class="text-[12.5px] text-ink/50">{m.sg_registered_count({ count: registered.length })}</p>
		</div>
		<ul class="mt-2">
			{#each SANGHA_EVENTS as e (e.id)}
				{@const on = registered.includes(e.id)}
				<li
					class="flex flex-wrap items-center gap-[18px] border-b border-ink/7 py-4 last:border-b-0"
				>
					<div class="w-14 flex-none text-center">
						<p class="font-serif text-[29px]/none">{String(e.date.getDate()).padStart(2, '0')}</p>
						<p class="mt-1 text-[10.5px] font-medium text-ink/45 uppercase">
							{monthShort.format(e.date)}
						</p>
					</div>
					<div class="min-w-[200px] flex-1">
						<p class="text-[15px] font-medium">{e.name()}</p>
						<p class="mt-[3px] text-[12.5px]/normal text-ink/55">{e.meta()}</p>
					</div>
					<button
						type="button"
						aria-pressed={on}
						onclick={() => (registered = toggle(registered, e.id))}
						class="cursor-pointer rounded-full border px-4 py-[9px] text-[12.5px] font-medium whitespace-nowrap transition-colors {on
							? 'border-sage/40 bg-sage/14 text-sage'
							: 'border-ink bg-ink text-cream hover:bg-[#3a342c]'}"
					>
						{on ? m.sg_registered() : m.sg_register()}
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<section
		aria-labelledby="sg-schedule"
		class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]"
	>
		<h2 id="sg-schedule" class="font-serif text-2xl">{m.sg_schedule_title()}</h2>
		<p class="mt-1 text-[12.5px] text-ink/50">{m.sg_schedule_hint()}</p>
		<ul class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-2.5">
			{#each SANGHA_SCHEDULE as r (r.time + r.title())}
				<li class="flex items-start gap-3.5 rounded-2xl bg-cream px-4 py-3.5">
					<p class="min-w-[52px] font-serif text-xl/tight text-gold-deep">{r.time}</p>
					<div class="min-w-0">
						<p class="text-[13.5px] font-medium">{r.title()}</p>
						<p class="mt-0.5 text-xs text-ink/52">{r.when()}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="sg-posts" class="flex flex-col gap-3.5">
		<h2 id="sg-posts" class="font-serif text-2xl">{m.sg_posts_title()}</h2>
		{#each SANGHA_POSTS as p (p.id)}
			{@const on = liked.includes(p.id)}
			<article class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px]">
				<header class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-full font-serif text-[13px] text-ink"
						style:background-color={p.avatar}
						aria-hidden="true"
					>
						{p.initials}
					</div>
					<div>
						<p class="text-sm font-medium">{p.name}</p>
						<p class="mt-0.5 text-xs text-ink/50">{p.meta()}</p>
					</div>
				</header>
				<p class="mt-3.5 text-[15px]/[1.7] text-pretty text-ink/82">{p.body()}</p>
				<footer class="mt-4 flex gap-[22px] border-t border-ink/6 pt-3.5 text-[13px] font-medium">
					<button
						type="button"
						aria-pressed={on}
						onclick={() => (liked = toggle(liked, p.id))}
						class="flex cursor-pointer items-center gap-2 whitespace-nowrap {on
							? 'text-gold-deep'
							: 'text-ink/55'}"
					>
						<span
							class="size-3 -rotate-45 rounded-[50%_0_50%_50%] {on ? 'bg-amber' : 'bg-ink/25'}"
							aria-hidden="true"
						></span>
						{m.sg_like({ count: p.likes + (on ? 1 : 0) })}
					</button>
					<span class="whitespace-nowrap text-ink/55">{m.sg_reply({ count: p.replies })}</span>
				</footer>
			</article>
		{/each}
	</section>
</div>
