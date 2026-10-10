<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { NAV_ITEMS, activeNavIndex } from '$lib/config/nav';

	const active = $derived(
		activeNavIndex(deLocalizeHref(page.url.pathname), page.url.searchParams.get('from'))
	);
</script>

<!-- Mobile tab bar (< 760px), mirrors the prototype's fixed 5-tab bar. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
<nav
	aria-label={m.nav_aria()}
	class="fixed inset-x-0 bottom-0 z-45 border-t border-ink/10 bg-cream-soft/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-md min-[760px]:hidden"
>
	<ul class="grid h-[62px] grid-cols-5">
		{#each NAV_ITEMS as item, i (item.path)}
			{@const on = i === active}
			<li class="min-w-0">
				<a
					href={localizeHref(item.path)}
					aria-current={on ? 'page' : undefined}
					class="relative flex h-full flex-col items-center justify-center gap-1.5"
				>
					<span
						class="absolute inset-x-[28%] top-0 h-0.5 rounded-b-sm {on
							? 'bg-gold'
							: 'bg-transparent'}"
						aria-hidden="true"
					></span>
					<span
						class="flex size-[22px] items-center justify-center rounded-[7px] {on
							? 'bg-gold/18'
							: 'bg-ink/6'}"
						aria-hidden="true"
					>
						<span class="size-[7px] rounded-full {on ? 'bg-gold' : 'bg-ink/35'}"></span>
					</span>
					<span
						class="text-[10.5px] font-medium whitespace-nowrap {on ? 'text-ink' : 'text-ink/60'}"
					>
						{item.label()}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
