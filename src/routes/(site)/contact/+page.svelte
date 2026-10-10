<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import ContactForm from '$lib/components/sections/ContactForm.svelte';
	import ContactSide from '$lib/components/sections/ContactSide.svelte';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.contact_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.contact_meta_description()} />
</svelte:head>

<div class="flex flex-col gap-7">
	<header>
		<p class="text-[10.5px] font-semibold tracking-[.16em] text-gold-deep">{m.contact_eyebrow()}</p>
		<h1 class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.15] font-medium text-pretty">
			{m.contact_title()}
		</h1>
		<p class="mt-2 max-w-[560px] text-[15px]/relaxed text-pretty text-ink/60">
			{m.contact_desc()}
		</p>
	</header>

	<div class="flex flex-wrap items-start gap-6">
		<ContactForm {form} userName={data.user?.name ?? ''} />
		<ContactSide />
	</div>
</div>
