<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SupportForm from '$lib/components/sections/SupportForm.svelte';
	import SupportUses from '$lib/components/sections/SupportUses.svelte';
</script>

<svelte:head>
	<title>{m.sup_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.sup_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-8">
	<header class="flex flex-col items-center gap-3 text-center">
		<Icon kind="lotus" tone="#b8862f" tint="rgba(184,134,47,.16)" size={56} />
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep uppercase">
			{m.sup_eyebrow()}
		</p>
		<h1
			class="max-w-[640px] font-serif text-[clamp(32px,6.4vw,40px)]/[1.15] font-medium text-pretty"
		>
			{m.sup_title()}
		</h1>
		<p class="max-w-[560px] text-[15px]/relaxed text-pretty text-ink/60">{m.sup_desc()}</p>
	</header>

	<div
		class="mx-auto grid w-full max-w-[920px] grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-5"
	>
		<SupportForm />
		<SupportUses />
	</div>
</div>
