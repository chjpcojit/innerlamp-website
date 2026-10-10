import { m } from '$lib/paraglide/messages';

export type TalkTopic = 'filial' | 'life' | 'meditation' | 'doctrine';

export interface TalkItem {
	id: number;
	topic: TalkTopic;
	topicLabel: () => string;
	title: () => string;
	speaker: () => string;
	/** Listen count, already abbreviated (`2.4k`). */
	plays: string;
	minutes: number;
}

export const TALK_TOPICS: { id: TalkTopic; label: () => string }[] = [
	{ id: 'filial', label: () => m.talks_tab_filial() },
	{ id: 'life', label: () => m.talks_tab_life() },
	{ id: 'meditation', label: () => m.talks_tab_meditation() },
	{ id: 'doctrine', label: () => m.talks_tab_doctrine() }
];

const minhDao = () => m.talk_speaker_minh_dao();
const quangTam = () => m.talk_speaker_quang_tam();
const dieuHanh = () => m.talk_speaker_dieu_hanh();

const TITLES = [
	() => m.talk_1_title(),
	() => m.talk_2_title(),
	() => m.talk_3_title(),
	() => m.talk_4_title(),
	() => m.talk_5_title(),
	() => m.talk_6_title(),
	() => m.talk_7_title(),
	() => m.talk_8_title()
];

const DATA: [TalkTopic, () => string, string, number][] = [
	['filial', minhDao, '2.4k', 46],
	['life', quangTam, '1.1k', 52],
	['meditation', minhDao, '3.2k', 38],
	['doctrine', quangTam, '1.8k', 61],
	['life', dieuHanh, '4.1k', 44],
	['doctrine', minhDao, '960', 29],
	['meditation', quangTam, '1.3k', 35],
	['filial', dieuHanh, '2.0k', 48]
];

const TOPIC_LABEL = Object.fromEntries(TALK_TOPICS.map((t) => [t.id, t.label])) as Record<
	TalkTopic,
	() => string
>;

/** Placeholder catalogue until the backend serves Dharma talks. */
export const TALK_LIST: TalkItem[] = DATA.map(([topic, speaker, plays, minutes], i) => ({
	id: i + 1,
	topic,
	topicLabel: TOPIC_LABEL[topic],
	title: TITLES[i],
	speaker,
	plays,
	minutes
}));
