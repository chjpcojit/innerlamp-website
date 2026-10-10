<script lang="ts">
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import AuthShell from '$lib/components/layout/AuthShell.svelte';
	import LoginForm from '$lib/features/auth/components/LoginForm.svelte';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.login_meta_title()}</title>
	<meta name="description" content={m.login_meta_description()} />
</svelte:head>

<AuthShell>
	<LoginForm {form} />
</AuthShell>
