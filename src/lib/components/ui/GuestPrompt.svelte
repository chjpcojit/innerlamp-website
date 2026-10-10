<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		title: string;
		desc: string;
	}

	let { title, desc }: Props = $props();
</script>

<section
	class="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[28px] bg-sand p-[clamp(24px,5vw,48px)] text-center"
>
	<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2] text-pretty">{title}</h1>
	<p class="text-sm/relaxed text-ink/60">{desc}</p>
	<Button href="/login">{m.header_login()}</Button>
</section>
