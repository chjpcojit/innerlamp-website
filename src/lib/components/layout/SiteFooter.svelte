<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import LampMark from '$lib/components/ui/LampMark.svelte';

	const linkClass = 'text-[13.5px] text-ink/70 transition-colors hover:text-gold-deep';
	const headClass = 'text-[10px] font-semibold tracking-[.14em] text-ink/45';
</script>

<footer
	class="border-t border-ink/8 bg-cream-soft pb-[calc(62px+env(safe-area-inset-bottom))] min-[760px]:pb-0"
>
	<div
		class="mx-auto flex max-w-[1200px] flex-col gap-[clamp(28px,5vw,40px)] px-[clamp(16px,4vw,40px)] pt-[clamp(32px,6vw,48px)] pb-7"
	>
		<div class="flex flex-wrap justify-between gap-10">
			<div class="flex max-w-[300px] flex-col gap-3.5">
				<div class="flex items-center gap-[11px]">
					<LampMark />
					<span class="text-[13px] font-semibold tracking-[.2em]">INNERLAMP</span>
				</div>
				<p class="font-serif text-base/normal text-ink/60 italic">{m.home_tagline()}</p>
			</div>
			<div class="flex flex-wrap gap-10">
				<nav class="flex min-w-[140px] flex-col gap-2.5" aria-labelledby="footer-practice">
					<h2 id="footer-practice" class={headClass}>{m.footer_practice()}</h2>
					<a href="#practice" class={linkClass}>{m.nav_practice()}</a>
					<a href="#events" class={linkClass}>{m.nav_events()}</a>
				</nav>
				<nav class="flex min-w-[140px] flex-col gap-2.5" aria-labelledby="footer-content">
					<h2 id="footer-content" class={headClass}>{m.footer_content()}</h2>
					<a href="#buddhas" class={linkClass}>{m.nav_buddhas()}</a>
					<a href="#temples" class={linkClass}>{m.nav_temples()}</a>
					<a href="#articles" class={linkClass}>{m.nav_articles()}</a>
				</nav>
				<nav class="flex min-w-[140px] flex-col gap-2.5" aria-labelledby="footer-account">
					<h2 id="footer-account" class={headClass}>{m.footer_account()}</h2>
					<a href={resolve(localizeHref('/settings') as Pathname)} class={linkClass}>
						{m.set_title()}
					</a>
					<a href={resolve(localizeHref('/login') as Pathname)} class={linkClass}>
						{m.header_login()}
					</a>
					<a href={resolve(localizeHref('/signup') as Pathname)} class={linkClass}>
						{m.header_signup()}
					</a>
				</nav>
				<nav class="flex min-w-[140px] flex-col gap-2.5" aria-labelledby="footer-support">
					<h2 id="footer-support" class={headClass}>{m.footer_support()}</h2>
					<a href="#help" class={linkClass}>{m.footer_help()}</a>
					<a href={resolve(localizeHref('/support') as Pathname)} class={linkClass}>
						{m.footer_donate()}
					</a>
					<a href="#contact" class={linkClass}>{m.footer_contact()}</a>
				</nav>
			</div>
		</div>
		<div
			class="flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-ink/8 pt-5 text-[12.5px] text-ink/50"
		>
			<p>{m.footer_copyright()}</p>
			<div class="flex gap-5">
				<a
					href={resolve(localizeHref('/terms') as Pathname)}
					class="text-ink/55 transition-colors hover:text-gold-deep"
				>
					{m.footer_terms()}
				</a>
				<a
					href={resolve(localizeHref('/privacy') as Pathname)}
					class="text-ink/55 transition-colors hover:text-gold-deep"
				>
					{m.footer_privacy()}
				</a>
			</div>
		</div>
	</div>
</footer>
