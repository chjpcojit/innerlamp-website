<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import LampVessel from '$lib/components/ui/LampVessel.svelte';
	import { LAMP_TYPES } from '$lib/content/lamps';

	// Back to this page after signing in. / Đăng nhập xong thì quay lại trang này.
	const loginHref = `${localizeHref('/login')}?${new URLSearchParams({ redirect: '/practice/lamp' })}`;
</script>

<section
	data-keep-dark
	aria-labelledby="lamp-title"
	class="relative flex flex-wrap items-center gap-10 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_70%_40%,#2a241c,#0f0d0a_72%)] p-[clamp(24px,4vw,48px)] text-[#f5eee0]"
>
	<div class="relative flex min-w-0 flex-[1_1_360px] flex-col items-start gap-[22px]">
		<div>
			<p class="text-[10.5px] font-semibold tracking-[.18em] text-[#e8b061] uppercase">
				{m.lamp_eyebrow()}
			</p>
			<h1 id="lamp-title" class="mt-2.5 font-serif text-[clamp(32px,6.4vw,40px)]/[1.2] font-medium">
				{m.lamp_title()}
			</h1>
			<p class="mt-2.5 max-w-[440px] text-sm/[1.65] text-pretty text-[#f2ebdd]/62">
				{m.lamp_desc()}
			</p>
		</div>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- locale-aware internal link -->
		<a
			href={loginHref}
			class="rounded-full bg-amber px-[34px] py-[15px] text-[15px] font-medium whitespace-nowrap text-[#1a1611] hover:bg-[#e6a94e]"
		>
			{m.lamp_login()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
	<div class="relative flex min-w-0 flex-[1_1_320px] justify-center py-5" aria-hidden="true">
		<LampVessel type={LAMP_TYPES[0]} mode="off" />
	</div>
</section>
