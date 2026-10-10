<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import LegalDocument from '$lib/components/sections/LegalDocument.svelte';
</script>

<svelte:head>
	<title>{m.legal_terms_meta_title()} · {m.app_name()}</title>
	<meta name="description" content={m.legal_terms_meta_description()} />
</svelte:head>

<LegalDocument kind="terms" />
