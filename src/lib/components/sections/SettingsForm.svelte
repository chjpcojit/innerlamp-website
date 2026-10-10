<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { deLocalizeHref, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import SettingRow from '$lib/components/ui/SettingRow.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { settings, type Settings } from '$lib/state/settings.svelte';
	import { theme, type ThemeMode } from '$lib/state/theme.svelte';

	interface Props {
		/** Privacy toggles only make sense with an account. */
		loggedIn: boolean;
	}

	let { loggedIn }: Props = $props();

	onMount(() => {
		settings.init();
		theme.init();
	});

	const BELL_TIME = '05:30';

	type ToggleKey =
		'bell' | 'fast' | 'memorial' | 'sangha' | 'vibrate' | 'showProfile' | 'showStreak';

	interface ToggleRow {
		key: ToggleKey;
		title: () => string;
		sub: () => string;
	}

	const reminders: ToggleRow[] = [
		{ key: 'bell', title: () => m.set_bell(), sub: () => m.set_bell_sub({ time: BELL_TIME }) },
		{ key: 'fast', title: () => m.set_fast(), sub: () => m.set_fast_sub() },
		{ key: 'memorial', title: () => m.set_memorial(), sub: () => m.set_memorial_sub() },
		{ key: 'sangha', title: () => m.set_sangha(), sub: () => m.set_sangha_sub() }
	];

	const privacy: ToggleRow[] = [
		{ key: 'showProfile', title: () => m.set_show_profile(), sub: () => m.set_show_profile_sub() },
		{ key: 'showStreak', title: () => m.set_show_streak(), sub: () => m.set_show_streak_sub() }
	];

	const basePath = $derived(deLocalizeHref(page.url.pathname));
	const locale = getLocale();
	const languages = $derived([
		{ value: 'vi', label: m.lang_vi(), href: localizeHref(basePath, { locale: 'vi' }) },
		{ value: 'en', label: m.lang_en(), href: localizeHref(basePath, { locale: 'en' }) }
	]);

	const set =
		<K extends keyof Settings>(key: K) =>
		(next: Settings[K]) =>
			settings.set(key, next);
</script>

{#snippet toggles(rows: ToggleRow[])}
	{#each rows as r (r.key)}
		<SettingRow title={r.title()} sub={r.sub()}>
			<Toggle
				checked={settings.value[r.key]}
				label={r.title()}
				onchange={(next) => settings.set(r.key, next)}
			/>
		</SettingRow>
	{/each}
{/snippet}

{#snippet group(title: string, body: Snippet)}
	<section class="flex flex-col gap-2.5" aria-label={title}>
		<h2 class="text-[10.5px] font-semibold tracking-[.14em] text-ink/45 uppercase">{title}</h2>
		<div class="overflow-hidden rounded-[22px] border border-ink/8 bg-paper">
			{@render body()}
		</div>
	</section>
{/snippet}

<div class="flex max-w-[860px] flex-col gap-6">
	<header>
		<h1 class="font-serif text-[clamp(32px,6.4vw,40px)]/[1.12] font-medium">{m.set_title()}</h1>
		<p class="mt-2 text-sm text-ink/55">{m.set_subtitle()}</p>
	</header>

	{#snippet remindersBody()}
		{@render toggles(reminders)}
	{/snippet}
	{#snippet privacyBody()}
		{@render toggles(privacy)}
	{/snippet}

	{#if loggedIn}
		{@render group(m.set_group_reminders(), remindersBody)}
	{/if}

	{#snippet display()}
		<SettingRow title={m.set_theme()} sub={m.set_theme_sub()}>
			<Segmented
				label={m.set_theme()}
				value={theme.mode}
				options={[
					{ value: 'light', label: m.set_theme_light() },
					{ value: 'dark', label: m.set_theme_dark() },
					{ value: 'system', label: m.set_theme_system() }
				] satisfies { value: ThemeMode; label: string }[]}
				onchange={(next) => theme.setMode(next)}
			/>
		</SettingRow>
		<SettingRow title={m.set_font()} sub={m.set_font_sub()}>
			<Segmented
				label={m.set_font()}
				value={settings.value.font}
				options={[
					{ value: 0, label: m.set_font_small() },
					{ value: 1, label: m.set_font_medium() },
					{ value: 2, label: m.set_font_large() }
				]}
				onchange={set('font')}
			/>
		</SettingRow>
		<SettingRow title={m.set_cal_first()} sub={m.set_cal_first_sub()}>
			<Segmented
				label={m.set_cal_first()}
				value={settings.value.calFirst}
				options={[
					{ value: 0, label: m.set_cal_lunar() },
					{ value: 1, label: m.set_cal_solar() }
				]}
				onchange={set('calFirst')}
			/>
		</SettingRow>
		<SettingRow title={m.set_language()}>
			<Segmented label={m.set_language()} value={locale} options={languages} />
		</SettingRow>
	{/snippet}
	{@render group(m.set_group_display(), display)}

	{#snippet sound()}
		<SettingRow title={m.set_sound()} sub={m.set_sound_sub()}>
			<Segmented
				label={m.set_sound()}
				value={settings.value.sound}
				options={[
					{ value: 0, label: m.set_sound_bell() },
					{ value: 1, label: m.set_sound_gong() },
					{ value: 2, label: m.set_sound_mo() }
				]}
				onchange={set('sound')}
			/>
		</SettingRow>
		<SettingRow title={m.set_vibrate()} sub={m.set_vibrate_sub()}>
			<Toggle checked={settings.value.vibrate} label={m.set_vibrate()} onchange={set('vibrate')} />
		</SettingRow>
	{/snippet}
	{@render group(m.set_group_sound(), sound)}

	{#if loggedIn}
		{@render group(m.set_group_privacy(), privacyBody)}
	{/if}
</div>
