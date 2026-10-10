<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import ProfileHeader from '$lib/components/sections/ProfileHeader.svelte';
	import ProfileStats from '$lib/components/sections/ProfileStats.svelte';
	import ProfileJournal from '$lib/components/sections/ProfileJournal.svelte';
	import ProfileBadges from '$lib/components/sections/ProfileBadges.svelte';
	import ProfileLinks from '$lib/components/sections/ProfileLinks.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.pf_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.pf_meta_description()} />
</svelte:head>

{#if data.user}
	<div class="flex flex-col gap-7">
		<ProfileHeader name={data.user.name || m.pf_name()} />
		<ProfileStats />
		<div class="flex flex-wrap items-start gap-6">
			<div class="flex min-w-0 flex-[1.3_1_460px] flex-col gap-6">
				<ProfileJournal />
				<ProfileBadges />
			</div>
			<ProfileLinks />
		</div>
	</div>
{:else}
	<section
		class="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[28px] bg-sand p-[clamp(24px,5vw,48px)] text-center"
	>
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2] text-pretty">{m.pf_guest_title()}</h1>
		<p class="text-sm/relaxed text-ink/60">{m.pf_guest_desc()}</p>
		<Button href="/login">{m.header_login()}</Button>
	</section>
{/if}
