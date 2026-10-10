<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import AuthShell from '$lib/components/layout/AuthShell.svelte';
	import SignupForm from '$lib/features/auth/components/SignupForm.svelte';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.signup_meta_title()}</title>
	<meta name="description" content={m.signup_meta_description()} />
</svelte:head>

<AuthShell>
	<SignupForm {form} />
</AuthShell>
