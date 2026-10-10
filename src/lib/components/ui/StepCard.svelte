<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		step: number;
		title: string;
		children: Snippet;
		class?: string;
	}

	let { step, title, children, class: className = '' }: Props = $props();
</script>

<section class="rounded-[22px] border border-ink/8 bg-paper px-6 py-[22px] {className}">
	<h2 class="mb-3.5 flex items-center gap-2.5 text-[15.5px] font-medium">
		<span
			class="flex size-[26px] flex-none items-center justify-center rounded-full bg-ink text-xs font-semibold text-cream"
			aria-hidden="true"
		>
			{step}
		</span>
		{title}
	</h2>
	{@render children()}
</section>
