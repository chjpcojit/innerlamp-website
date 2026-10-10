<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';
	import { getSubNav } from '$lib/config/breadcrumbs';

	const path = $derived(deLocalizeHref(page.url.pathname));
	const sub = $derived(getSubNav(path));
</script>

{#if sub}
	<div class="border-t border-ink/6">
		<div
			class="mx-auto flex min-h-12 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-[clamp(16px,3vw,40px)] py-1.5"
		>
			<nav aria-label={m.crumb_aria()}>
				<ol class="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
					{#each sub.crumbs as c, i (i)}
						{@const last = i === sub.crumbs.length - 1}
						<li class="flex min-w-0 items-center gap-2">
							{#if i > 0}<span class="text-ink/30" aria-hidden="true">›</span>{/if}
							{#if !last && c.href}
								<a
									href={localizeHref(c.href)}
									class="max-w-[260px] truncate text-ink/55 transition-colors hover:text-gold-deep"
								>
									{c.label()}
								</a>
							{:else}
								<span
									class="max-w-[260px] truncate {last ? 'font-medium text-ink' : 'text-ink/55'}"
									aria-current={last ? 'page' : undefined}
								>
									{c.label()}
								</span>
							{/if}
						</li>
					{/each}
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</ol>
			</nav>
			{#if sub.tabs.length > 1}
				<ul
					class="flex max-w-full gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
					style:scrollbar-width="none"
				>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
					{#each sub.tabs as t (t.href)}
						{@const on = t.href === path}
						<li class="flex-none">
							<a
								href={localizeHref(t.href)}
								aria-current={on ? 'page' : undefined}
								class="block rounded-full border px-[13px] py-[7px] text-xs font-medium whitespace-nowrap transition-colors {on
									? 'border-ink bg-ink text-cream'
									: 'border-ink/12 text-ink/68 hover:bg-[#f1e8d8]'}"
							>
								{t.label()}
							</a>
						</li>
					{/each}
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</ul>
			{/if}
		</div>
	</div>
{/if}
