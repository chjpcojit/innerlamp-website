import type { DharmaTalkSummary } from '$lib/types/dharma-talk';
import { formatArticleDate } from './article';

/** `Speaker · dd/mm/yyyy`, skipping a missing date. */
export function talkMeta(talk: DharmaTalkSummary) {
	return [talk.speaker, formatArticleDate(talk.published_date)].filter(Boolean).join(' · ');
}
