<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { LIBRARY_CATEGORIES, type LibraryCategory } from '$lib/content/library';

	interface Props {
		query: string;
		active: LibraryCategory | null;
	}

	let { query = $bindable(), active = $bindable() }: Props = $props();

	const chip =
		'cursor-pointer rounded-full border px-4 py-[9px] text-[13px] font-medium transition-colors';
	const chipOn = 'border-ink bg-ink text-cream';
	const chipOff = 'border-ink/12 bg-paper text-ink/70 hover:bg-white';
</script>

<div class="flex flex-col gap-8">
	<div class="flex flex-wrap items-end justify-between gap-6">
		<div>
			<h1 class="font-serif text-[clamp(31px,7.2vw,40px)]">{m.lib_title()}</h1>
			<p class="mt-2 text-sm text-ink/55">{m.lib_subtitle()}</p>
		</div>
		<label
			class="flex h-[46px] w-[min(100%,380px)] items-center gap-2.5 rounded-[14px] border border-ink/10 bg-paper px-4 text-[13.5px]"
		>
			<span class="sr-only">{m.lib_search_label()}</span>
			<span
				class="size-[11px] flex-none rounded-full border-[1.5px] border-ink/40"
				aria-hidden="true"
			></span>
			<input
				type="search"
				bind:value={query}
				placeholder={m.lib_search_placeholder()}
				class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/40"
			/>
		</label>
	</div>

	<div class="flex flex-wrap gap-2" role="group" aria-label={m.lib_filter_label()}>
		<button
			type="button"
			class="{chip} {active === null ? chipOn : chipOff}"
			aria-pressed={active === null}
			onclick={() => (active = null)}
		>
			{m.lib_cat_all()}
		</button>
		{#each LIBRARY_CATEGORIES as c (c.id)}
			<button
				type="button"
				class="{chip} {active === c.id ? chipOn : chipOff}"
				aria-pressed={active === c.id}
				onclick={() => (active = c.id)}
			>
				{c.label()}
			</button>
		{/each}
	</div>
</div>
