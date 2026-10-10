/**
 * Day almanac (trực, nạp âm, tiết khí, hướng xuất hành…) ported from the design prototype's
 * `lunar.js` / `dayVals`. Pure functions; all display text is returned as `m.*` message keys
 * (resolved with `msg()`), so the module stays framework- and locale-agnostic.
 */
import { jdFromDate, solarToLunar, sunLongitude } from '$lib/utils/lunar';

export type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
export type Rating = 'great' | 'good' | 'neutral' | 'bad' | 'worst';

const PI = Math.PI;

/** Sexagenary terms are proper nouns kept in Vietnamese in both locales. */
export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = [
	'Tý',
	'Sửu',
	'Dần',
	'Mão',
	'Thìn',
	'Tỵ',
	'Ngọ',
	'Mùi',
	'Thân',
	'Dậu',
	'Tuất',
	'Hợi'
];
/** Zodiac emoji per earthly branch. */
export const ZODIAC = ['🐀', '🐃', '🐅', '🐈', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐖'];

const CAN_ELEMENT: Element[] = [
	'moc',
	'moc',
	'hoa',
	'hoa',
	'tho',
	'tho',
	'kim',
	'kim',
	'thuy',
	'thuy'
];
const CHI_ELEMENT: Element[] = [
	'thuy',
	'tho',
	'moc',
	'moc',
	'tho',
	'hoa',
	'hoa',
	'tho',
	'kim',
	'kim',
	'tho',
	'thuy'
];
/** Element of each of the 30 nạp âm pairs. */
const NAPAM_ELEMENT: Element[] = [
	'kim', 'hoa', 'moc', 'tho', 'kim', 'hoa', 'thuy', 'tho', 'kim', 'moc',
	'thuy', 'tho', 'hoa', 'moc', 'thuy', 'kim', 'hoa', 'moc', 'tho', 'kim',
	'hoa', 'thuy', 'tho', 'kim', 'moc', 'thuy', 'tho', 'hoa', 'moc', 'thuy'
]; // prettier-ignore

export const ELEMENT_COLOR: Record<Element, string> = {
	kim: '#B8862F',
	moc: '#5E8A6C',
	thuy: '#4F7896',
	hoa: '#C0573F',
	tho: '#8A6A45'
};

/** 12 trực: [score, good activities, bad activities] — activity slugs map to `act_*` messages. */
const TRUC: { name: string; score: -1 | 0 | 1; good: string[]; bad: string[] }[] = [
	{ name: 'Kiến', score: 0, good: ['travel', 'assume_post', 'visit'], bad: ['groundbreaking', 'dig_well', 'burial'] },
	{ name: 'Trừ', score: 1, good: ['clear_old', 'heal', 'repent'], bad: ['wedding', 'far_travel'] },
	{ name: 'Mãn', score: 1, good: ['worship_bless', 'open_biz', 'store'], bad: ['lawsuit', 'assume_post'] },
	{ name: 'Bình', score: 0, good: ['repair', 'road', 'daily'], bad: ['big_open', 'dig_pond'] },
	{ name: 'Định', score: 1, good: ['wedding', 'sign', 'enroll', 'enshrine'], bad: ['lawsuit', 'far_travel'] },
	{ name: 'Chấp', score: 0, good: ['build', 'plant', 'recruit'], bad: ['big_spend', 'move'] },
	{ name: 'Phá', score: -1, good: ['demolish', 'heal'], bad: ['wedding', 'open_biz', 'sign'] },
	{ name: 'Nguy', score: -1, good: ['worship', 'retreat'], bad: ['climb', 'boat', 'risky'] },
	{ name: 'Thành', score: 1, good: ['open_biz', 'wedding', 'move_in', 'start_work'], bad: ['lawsuit'] },
	{ name: 'Thu', score: -1, good: ['harvest', 'collect_debt', 'store'], bad: ['burial', 'start_work', 'travel'] },
	{ name: 'Khai', score: 1, good: ['open_biz', 'travel', 'wealth', 'enroll'], bad: ['burial', 'groundbreaking'] },
	{ name: 'Bế', score: -1, good: ['dike', 'retreat'], bad: ['open_biz', 'travel', 'eyes'] }
]; // prettier-ignore

const RATINGS: Record<Rating, { color: string }> = {
	great: { color: '#3F7A55' },
	good: { color: '#5E8A6C' },
	neutral: { color: '#8A6A45' },
	bad: { color: '#B8662F' },
	worst: { color: '#C64545' }
};

/** Ordered worst → best, for the rating scale. */
export const RATING_SCALE: { rating: Rating; score: number }[] = [
	{ rating: 'worst', score: -2 },
	{ rating: 'bad', score: -1 },
	{ rating: 'neutral', score: 0 },
	{ rating: 'good', score: 1 },
	{ rating: 'great', score: 2 }
];

export function ratingColor(rating: Rating): string {
	return RATINGS[rating].color;
}

function solarTermIndex(jd: number): number {
	return Math.floor((sunLongitude(jd + 0.5 - 7 / 24) / PI) * 12) % 24;
}

export interface DayAlmanac {
	rating: Rating;
	score: number;
	/** Trực name (Kiến…Bế). */
	truc: string;
	auspicious: boolean;
	good: string[];
	bad: string[];
	termIndex: number;
	termNextIndex: number;
	termFrom: Date;
	termDaysLeft: number;
	napamIndex: number;
	napamElement: Element;
	can: string;
	chi: string;
	canElement: Element;
	chiElement: Element;
}

export function dayAlmanac(date: Date): DayAlmanac {
	const dd = date.getDate();
	const mm = date.getMonth() + 1;
	const yy = date.getFullYear();
	const jd = jdFromDate(dd, mm, yy);
	const dc = (jd + 9) % 10;
	const dz = (jd + 1) % 12;
	const lunar = solarToLunar(date);
	const ti = solarTermIndex(jd);
	let start = 0;
	while (start < 20 && solarTermIndex(jd - start - 1) === ti) start++;
	let next = 1;
	while (next < 20 && solarTermIndex(jd + next) === ti) next++;
	const monthBranch = (2 + Math.floor(((ti + 3) % 24) / 2)) % 12;
	const truc = TRUC[(dz - monthBranch + 12) % 12];
	const auspicious = '110011010010'[(dz - ((lunar.month - 1) % 6) * 2 + 12) % 12] === '1';
	const score = (auspicious ? 1 : -1) + truc.score;
	const rating: Rating =
		score >= 2
			? 'great'
			: score === 1
				? 'good'
				: score === 0
					? 'neutral'
					: score === -1
						? 'bad'
						: 'worst';
	const napamIndex = Math.floor(((((dc * 6 - dz * 5) % 60) + 60) % 60) / 2);
	return {
		rating,
		score,
		truc: truc.name,
		auspicious,
		good: truc.good,
		bad: truc.bad,
		termIndex: ti,
		termNextIndex: (ti + 1) % 24,
		termFrom: new Date(yy, mm - 1, dd - start),
		termDaysLeft: next,
		napamIndex,
		napamElement: NAPAM_ELEMENT[napamIndex],
		can: CAN[dc],
		chi: CHI[dz],
		canElement: CAN_ELEMENT[dc],
		chiElement: CHI_ELEMENT[dz]
	};
}

export type Direction = 'ne' | 'nw' | 'sw' | 's' | 'se' | 'e' | 'n' | 'w';

export interface DayDirections {
	joy: Direction;
	wealth: Direction;
	/** `null` when the Crane spirit is "in heaven" (no direction to avoid). */
	crane: Direction | null;
}

const JOY: Direction[] = ['ne', 'nw', 'sw', 's', 'se'];
const WEALTH: Direction[] = ['se', 'se', 'e', 'e', 'n', 's', 'sw', 'sw', 'w', 'nw'];
const CRANE: [number, Direction | null][] = [
	[45, 'ne'], [51, 'e'], [56, 'se'], [62, 's'], [67, 'sw'], [73, 'w'], [78, 'nw'], [84, 'n'], [89, null]
]; // prettier-ignore

export function dayDirections(date: Date): DayDirections {
	const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
	const dc = (jd + 9) % 10;
	const g60 = (jd + 49) % 60;
	const gx = g60 < 45 ? g60 + 60 : g60;
	const crane = [...CRANE].reverse().find(([from]) => gx >= from) ?? CRANE[8];
	return { joy: JOY[dc % 5], wealth: WEALTH[dc], crane: crane[1] };
}

/** Ages clashing with the day: the day's opposing branch with its two matching stems. */
export function dayClash(date: Date): {
	names: string[];
	zodiac: string;
	branch: string;
	day: string;
} {
	const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
	const dc = (jd + 9) % 10;
	const dz = (jd + 1) % 12;
	const opposite = (dz + 6) % 12;
	return {
		names: [`${CAN[(dc + 4) % 10]} ${CHI[opposite]}`, `${CAN[(dc + 6) % 10]} ${CHI[opposite]}`],
		zodiac: ZODIAC[opposite],
		branch: CHI[opposite],
		day: `${CAN[dc]} ${CHI[dz]}`
	};
}

/** Stem–branch names of the day, month and year (month stem/branch follow the lunar month). */
export function canChiOfDate(date: Date) {
	const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
	const lunar = solarToLunar(date);
	const dc = (jd + 9) % 10;
	const dz = (jd + 1) % 12;
	const mc = (lunar.year * 12 + lunar.month + 3) % 10;
	const mz = (lunar.month + 1) % 12;
	return {
		day: `${CAN[dc]} ${CHI[dz]}`,
		month: `${CAN[mc]} ${CHI[mz]}`,
		year: `${CAN[(lunar.year + 6) % 10]} ${CHI[(lunar.year + 8) % 12]}`
	};
}

export const VERSE_COUNT = 4;
