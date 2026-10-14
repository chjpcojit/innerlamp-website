<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	interface Props {
		/** Current page, 1-based. */
		page: number;
		totalPages: number;
		/** Extra query params kept on every link, e.g. an active filter. */
		params?: Record<string, string>;
	}

	let { page, totalPages, params = {} }: Props = $props();

	/** Up to 5 numbers around the current page, always including first and last. */
	const pages = $derived(
		Array.from({ length: totalPages }, (_, i) => i + 1).filter(
			(p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
		)
	);
	/** Query-only link: stays on the current (already localised) path. */
	const link = (p: number) => `?${new URLSearchParams({ ...params, page: String(p) })}`;

	const base =
		'inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-[13px] font-medium transition-colors';
	const on = 'border-ink bg-ink text-cream';
	const off = 'border-ink/12 bg-paper text-ink/70 hover:bg-white';
	const disabled = 'pointer-events-none border-ink/8 text-ink/30';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- query-only hrefs keep the current path -->
{#if totalPages > 1}
	<nav aria-label={m.pagination_label()} class="flex flex-wrap items-center justify-center gap-2">
		<a
			href={link(page - 1)}
			class="{base} {page > 1 ? off : disabled}"
			aria-disabled={page <= 1}
			tabindex={page <= 1 ? -1 : undefined}
			rel="prev"
		>
			{m.pagination_prev()}
		</a>
		{#each pages as p, i (p)}
			{#if i > 0 && p - pages[i - 1] > 1}<span class="px-1 text-ink/40" aria-hidden="true">…</span
				>{/if}
			<a
				href={link(p)}
				class="{base} {p === page ? on : off}"
				aria-current={p === page ? 'page' : undefined}
				aria-label={m.pagination_page({ page: p })}
			>
				{p}
			</a>
		{/each}
		<a
			href={link(page + 1)}
			class="{base} {page < totalPages ? off : disabled}"
			aria-disabled={page >= totalPages}
			tabindex={page >= totalPages ? -1 : undefined}
			rel="next"
		>
			{m.pagination_next()}
		</a>
	</nav>
{/if}
