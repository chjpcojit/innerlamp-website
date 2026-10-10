<script lang="ts">
	import { onMount } from 'svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { NAV_ITEMS, activeNavIndex } from '$lib/config/nav';
	import { notifications } from '$lib/state/notifications.svelte';
	import LampMark from '$lib/components/ui/LampMark.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { SessionUser } from '$lib/types/user';
	import Button from '$lib/components/ui/Button.svelte';
	import MobileMenu from '$lib/components/layout/MobileMenu.svelte';
	import ThemeToggle from '$lib/components/layout/ThemeToggle.svelte';
	import Breadcrumbs from '$lib/components/layout/Breadcrumbs.svelte';

	let { user }: { user: SessionUser | null } = $props();

	const initials = $derived(
		user?.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(-2)
			.map((w) => w[0].toUpperCase())
			.join('') || null
	);

	let menuOpen = $state(false);

	onMount(() => notifications.init());

	// Header turns from transparent to frosted as the page scrolls (0 → 1 over 60px, in 0.1 steps).
	let scrollY = $state(0);
	const progress = $derived(Math.round(Math.min(1, scrollY / 60) * 10) / 10);

	// The active nav item gets a pill that slides between links (prototype `measureNav`).
	let navEl = $state<HTMLElement>();
	let pill = $state({ x: 0, w: 0, on: false, anim: false });

	const links = NAV_ITEMS.map((item) => ({ href: localizeHref(item.path), label: item.label }));

	const path = $derived(deLocalizeHref(page.url.pathname));
	const activeIndex = $derived(activeNavIndex(path, page.url.searchParams.get('from')));

	function measure() {
		const el =
			activeIndex >= 0
				? navEl?.querySelectorAll<HTMLElement>('[data-nav-i]')[activeIndex]
				: undefined;
		const next = el ? { x: el.offsetLeft, w: el.offsetWidth, on: true } : { x: 0, w: 0, on: false };
		if (next.x === pill.x && next.w === pill.w && next.on === pill.on) return;
		// Slide only between two visible states; the first appearance just fades in.
		pill = { ...next, anim: pill.on && next.on };
	}

	$effect(() => {
		void activeIndex;
		measure();
		document.fonts?.ready.then(measure);
	});
</script>

<svelte:window bind:scrollY onresize={measure} />

<header
	class="il-site-header sticky top-0 z-40 border-b transition-[background-color,border-color] duration-250 ease-in-out"
	style:background-color="rgba(251,247,239,{+(0.3 * progress).toFixed(2)})"
	style:backdrop-filter="blur({Math.round(16 * progress)}px)"
	style:border-color="rgba(34,30,25,{+(0.08 * progress).toFixed(3)})"
>
	<div
		class="mx-auto flex h-[clamp(60px,9vw,72px)] max-w-7xl items-center gap-[clamp(8px,2.4vw,32px)] px-[clamp(16px,3vw,40px)]"
	>
		<button
			type="button"
			onclick={() => (menuOpen = true)}
			aria-label={m.header_menu_open()}
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			class="flex size-10 flex-none cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border border-ink/12 hover:bg-sand/60 md:hidden"
		>
			<span class="h-[1.5px] w-4 bg-ink"></span>
			<span class="h-[1.5px] w-4 bg-ink"></span>
			<span class="h-[1.5px] w-4 bg-ink"></span>
		</button>
		<a
			href={resolve(localizeHref('/') as Pathname)}
			class="flex flex-none items-center gap-[11px]"
			aria-label={m.header_home_aria()}
		>
			<LampMark />
			<span class="hidden text-[13px] font-semibold tracking-[.2em] min-[560px]:inline">
				INNERLAMP
			</span>
		</a>
		<nav
			bind:this={navEl}
			aria-label={m.nav_aria()}
			class="relative hidden min-w-0 flex-1 gap-0.5 overflow-x-auto md:flex [&::-webkit-scrollbar]:hidden"
			style:scrollbar-width="none"
		>
			<span
				class="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-[#f1e8d8] will-change-[transform,width]"
				style:width="{pill.w}px"
				style:transform="translateX({pill.x}px)"
				style:opacity={pill.on ? 1 : 0}
				style:transition={pill.anim
					? 'transform .38s cubic-bezier(.4,0,.2,1), width .38s cubic-bezier(.4,0,.2,1), opacity .2s ease'
					: 'opacity .2s ease'}
				aria-hidden="true"
			></span>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- in-page hash anchors -->
			{#each links as link, i (link.href)}
				<a
					href={link.href}
					data-nav-i={i}
					aria-current={i === activeIndex ? 'page' : undefined}
					class="relative flex-none rounded-full px-[clamp(8px,1.1vw,15px)] py-[9px] text-[clamp(12.5px,1.4vw,13.5px)] font-medium whitespace-nowrap transition-[color,background-color] duration-250 hover:bg-[#f1e8d8]/55 {i ===
					activeIndex
						? 'text-ink'
						: 'text-ink/60'}"
				>
					{link.label()}
				</a>
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</nav>
		<div class="ml-auto flex flex-none items-center gap-2">
			<ThemeToggle />
			{#if user}
				<a
					href={resolve(localizeHref('/notifications') as Pathname)}
					aria-label={m.header_notifications_aria()}
					aria-current={path === '/notifications' ? 'page' : undefined}
					class="relative flex size-10 flex-none items-center justify-center rounded-full border border-ink/12 transition-colors hover:bg-sand/60 {path ===
					'/notifications'
						? 'bg-[#f1e8d8]'
						: ''}"
				>
					<Icon kind="notif" tone="#4a443c" tint="transparent" size={40} />
					{#if notifications.unread > 0}
						<span
							class="absolute top-2 right-2 size-2 rounded-full bg-amber ring-2 ring-cream-soft"
							aria-hidden="true"
						></span>
					{/if}
				</a>
			{/if}
			<a
				href={resolve(localizeHref('/practice/lamp') as Pathname)}
				data-keep-dark
				class="flex flex-none items-center gap-[9px] rounded-full bg-ink px-3.5 py-[11px] text-[13.5px] font-medium whitespace-nowrap text-cream transition-colors hover:bg-[#3a342c] lg:px-[18px]"
			>
				<span
					class="h-2.5 w-[7px] rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-[#e6a94e] shadow-[0_0_9px_rgba(217,150,60,.9)]"
					aria-hidden="true"
				></span>
				<span class="max-lg:sr-only">{m.header_lamp()}</span>
			</a>
			{#if user}
				<a
					href={resolve(localizeHref('/profile') as Pathname)}
					aria-label={m.header_account_aria()}
					class="flex size-10 items-center justify-center rounded-full bg-sand font-serif text-[13px] text-gold-deep transition-colors hover:bg-sand-deep"
				>
					{initials ?? '·'}
				</a>
			{:else}
				<Button href="/login" variant="outline">
					{m.header_login()}
				</Button>
				<Button href="/signup" variant="gold">
					{m.header_signup()}
				</Button>
			{/if}
		</div>
	</div>
	<Breadcrumbs />
</header>

<MobileMenu open={menuOpen} {links} onclose={() => (menuOpen = false)} />
