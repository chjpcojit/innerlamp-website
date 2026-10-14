<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import GuestPrompt from '$lib/components/ui/GuestPrompt.svelte';
	import ProfileEditForm from '$lib/features/profile/components/ProfileEditForm.svelte';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.pf_edit()} · {m.app_name()}</title>
	<meta name="description" content={m.pfe_meta_description()} />
</svelte:head>

{#if !data.user}
	<GuestPrompt title={m.pf_guest_title()} desc={m.pf_guest_desc()} />
{:else if data.profile}
	<ProfileEditForm profile={data.profile} {form} />
{:else}
	<section
		class="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-[28px] bg-sand p-[clamp(24px,5vw,48px)] text-center"
	>
		<h1 class="font-serif text-[clamp(26px,5vw,34px)]/[1.2]">{m.pf_edit()}</h1>
		<p class="text-sm/relaxed text-ink/60" role="alert">{m.pfe_load_error()}</p>
	</section>
{/if}
