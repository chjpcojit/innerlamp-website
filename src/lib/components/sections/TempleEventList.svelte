<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { monthShort, parseIsoDate } from '$lib/utils/events';
	import type { TempleEventEntry, TempleEventKind } from '$lib/types/temple-event';

	interface Props {
		entries: TempleEventEntry[];
	}

	let { entries }: Props = $props();

	const KIND_LABELS: Record<string, () => string> = {
		KHOA_TU: () => m.temple_ev_kind_khoa_tu(),
		PHAP_HOI: () => m.temple_ev_kind_phap_hoi(),
		LE_CAU_AN: () => m.temple_ev_kind_le_cau_an(),
		LE_CAU_SIEU: () => m.temple_ev_kind_le_cau_sieu(),
		LE_HOI: () => m.temple_ev_kind_le_hoi(),
		THUYET_PHAP: () => m.temple_ev_kind_thuyet_phap()
	};
	const kindLabel = (kind: TempleEventKind) => (KIND_LABELS[kind] ?? m.temple_ev_kind_khac)();

	// Times come as RFC 3339 `+07:00`; show them in the temple's zone, not the viewer's.
	const time = $derived(
		new Intl.DateTimeFormat(getLocale(), {
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23',
			timeZone: 'Asia/Ho_Chi_Minh'
		})
	);

	function meta(e: TempleEventEntry): string {
		const when = e.event.is_all_day
			? m.temple_ev_all_day()
			: `${time.format(new Date(e.starts_at))}–${time.format(new Date(e.ends_at))}`;
		const lunar = m.ev_lunar_date({ day: e.lunar_date.day, month: e.lunar_date.month });
		return [kindLabel(e.event.kind), when, lunar].join(' · ');
	}
</script>

{#if entries.length}
	<ul class="mt-2 flex flex-col">
		{#each entries as e (`${e.event.id}-${e.starts_at}`)}
			{@const date = parseIsoDate(e.solar_date)}
			{@const cancelled = e.event.status === 'CANCELLED'}
			<li class="flex items-center gap-[18px] border-b border-ink/8 py-4 last:border-b-0">
				<div class="w-14 flex-none text-center">
					<div class="font-serif text-[28px]/none font-medium">{date.getDate()}</div>
					<div class="mt-1 text-[10.5px] font-medium text-ink/45">{monthShort(date)}</div>
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-[15px] font-medium {cancelled ? 'text-ink/45 line-through' : ''}">
							{e.event.title}
						</span>
						{#if cancelled || e.event.status === 'POSTPONED'}
							<span
								class="rounded-full border border-ink/15 px-2 py-0.5 text-[11px] font-medium text-ink/60"
							>
								{cancelled ? m.temple_ev_cancelled() : m.temple_ev_postponed()}
							</span>
						{/if}
					</div>
					<div class="mt-[3px] text-xs/normal text-ink/55">{meta(e)}</div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="mt-3 text-sm text-ink/55">{m.temple_ev_empty()}</p>
{/if}
