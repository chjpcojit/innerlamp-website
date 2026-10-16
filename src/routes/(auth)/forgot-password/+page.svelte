<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import AuthShell from '$lib/components/layout/AuthShell.svelte';
	import ForgotPasswordForm from '$lib/features/auth/components/ForgotPasswordForm.svelte';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.forgot_meta_title()}</title>
	<meta name="description" content={m.forgot_meta_description()} />
</svelte:head>

<AuthShell>
	<ForgotPasswordForm {form} />
</AuthShell>
