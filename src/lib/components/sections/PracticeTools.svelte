<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { PRACTICE_TOOLS } from '$lib/content/practice';
</script>

<section aria-label={m.practice_tools_aria()}>
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
		{#each PRACTICE_TOOLS as t (t.icon)}
			<li
				class="relative rounded-[22px] border border-ink/8 bg-paper p-5 {t.href
					? 'transition-colors hover:bg-white'
					: ''}"
			>
				<Icon kind={t.icon} tone={t.tone} tint={t.tint} size={44} />
				<h3 class="mt-4 text-[15px] font-medium">
					{#if t.href}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
						<a
							href={localizeHref(t.href)}
							class="text-ink after:absolute after:inset-0 after:rounded-[22px]"
						>
							{t.title()}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{:else}
						{t.title()}
					{/if}
				</h3>
				<p class="mt-1 text-[12.5px]/normal text-ink/50">{t.sub()}</p>
			</li>
		{/each}
	</ul>
</section>
