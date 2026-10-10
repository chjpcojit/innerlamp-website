<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { LEGAL_DOCS, type LegalKind } from '$lib/content/legal';

	interface Props {
		kind: LegalKind;
	}

	let { kind }: Props = $props();

	const doc = $derived(LEGAL_DOCS[kind]);
	const tabs = $derived([
		{ kind: 'terms' as const, label: m.legal_terms_title(), href: localizeHref('/terms') },
		{ kind: 'privacy' as const, label: m.legal_privacy_title(), href: localizeHref('/privacy') }
	]);
</script>

<div class="flex flex-col gap-6">
	<header>
		<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.15] font-medium text-pretty">
			{doc.title()}
		</h1>
		<p class="mt-2 text-[13px] text-ink/50">{m.legal_updated()}</p>
	</header>

	<nav
		aria-label={m.legal_tabs_label()}
		class="flex max-w-full gap-0.5 self-start rounded-full bg-ink/6 p-[3px]"
	>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal links -->
		{#each tabs as t (t.kind)}
			<a
				href={t.href}
				aria-current={t.kind === kind ? 'page' : undefined}
				class="rounded-full px-[18px] py-[9px] text-[13px] font-medium whitespace-nowrap transition-colors {t.kind ===
				kind
					? 'bg-paper text-ink shadow-[0_1px_3px_rgba(34,30,25,.12)]'
					: 'text-ink/55 hover:text-ink/80'}"
			>
				{t.label}
			</a>
		{/each}
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</nav>

	<div class="flex flex-wrap items-start gap-8">
		<nav
			aria-label={m.legal_toc()}
			class="flex min-w-[200px] flex-[0_1_240px] flex-col gap-0.5 min-[760px]:sticky min-[760px]:top-36"
		>
			<p class="mb-2 text-[10.5px] font-semibold tracking-[.14em] text-ink/45">{m.legal_toc()}</p>
			{#each doc.sections as s, i (i)}
				<a
					href="#legal-{kind}-{i + 1}"
					class="rounded-[10px] px-3 py-2 text-[13px]/[1.4] text-ink/70 transition-colors hover:bg-[#f1e8d8] hover:text-ink"
				>
					{i + 1}. {s.title()}
				</a>
			{/each}
		</nav>

		<article
			class="flex max-w-[760px] min-w-0 flex-[1_1_480px] flex-col gap-7 rounded-[22px] border border-ink/8 bg-paper p-[clamp(22px,4vw,40px)]"
		>
			<p class="text-[15px]/relaxed text-pretty text-ink/60">{doc.intro()}</p>
			{#each doc.sections as s, i (i)}
				<section id="legal-{kind}-{i + 1}" class="scroll-mt-36">
					<h2 class="font-serif text-[22px] font-medium">{i + 1}. {s.title()}</h2>
					<div class="mt-2.5 flex flex-col gap-2.5">
						{#each s.paragraphs as p, k (k)}
							<p class="text-[15px]/[1.75] text-pretty text-ink/75">{p()}</p>
						{/each}
					</div>
				</section>
			{/each}
			<p class="border-t border-ink/8 pt-5 text-[13px]/relaxed text-ink/60">
				{doc.question()}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- locale-aware internal link -->
				<a href={localizeHref('/contact')} class="text-gold-deep underline underline-offset-2">
					{m.legal_question_link()}</a
				>.
			</p>
		</article>
	</div>
</div>
