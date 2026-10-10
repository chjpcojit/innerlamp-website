/**
 * Vietnamese lunar calendar (UTC+7), ported from the design prototype's `lunar.js`
 * (Hồ Ngọc Đức's algorithm). Pure functions, no framework imports.
 */

const PI = Math.PI;
const TZ = 7;
const SYNODIC_MONTH = 29.530588853;
const EPOCH = 2415021.076998695;

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** Days on which the strict / regular vegetarian observance applies. */
const STRICT_FAST_DAYS = [1, 15];
const FAST_DAYS = [8, 14, 23, 30];

export type DayAdvice = 'strict' | 'fast' | 'regular';

export interface LunarDate {
	day: number;
	/** 1–12 */
	month: number;
	year: number;
	leap: boolean;
}

export function jdFromDate(dd: number, mm: number, yy: number): number {
	const a = Math.floor((14 - mm) / 12);
	const y = yy + 4800 - a;
	const m = mm + 12 * a - 3;
	let jd =
		dd +
		Math.floor((153 * m + 2) / 5) +
		365 * y +
		Math.floor(y / 4) -
		Math.floor(y / 100) +
		Math.floor(y / 400) -
		32045;
	if (jd < 2299161) {
		jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
	}
	return jd;
}

function newMoonJd(k: number): number {
	const T = k / 1236.85;
	const T2 = T * T;
	const T3 = T2 * T;
	const dr = PI / 180;
	let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
	jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
	const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
	const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
	const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
	let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
	C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
	C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
	C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
	C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
	C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
	C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
	const deltat =
		T < -11
			? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
			: -0.000278 + 0.000265 * T + 0.000262 * T2;
	return jd1 + C1 - deltat;
}

export function sunLongitude(jdn: number): number {
	const T = (jdn - 2451545.0) / 36525;
	const T2 = T * T;
	const dr = PI / 180;
	const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
	const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
	let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
	DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
	const L = (L0 + DL) * dr;
	return L - PI * 2 * Math.floor(L / (PI * 2));
}

function sunLong12(dayNumber: number): number {
	return Math.floor((sunLongitude(dayNumber - 0.5 - TZ / 24) / PI) * 6);
}

function newMoonDay(k: number): number {
	return Math.floor(newMoonJd(k) + 0.5 + TZ / 24);
}

function lunarMonth11(yy: number): number {
	const off = jdFromDate(31, 12, yy) - 2415021;
	const k = Math.floor(off / SYNODIC_MONTH);
	let nm = newMoonDay(k);
	if (sunLong12(nm) >= 9) nm = newMoonDay(k - 1);
	return nm;
}

function leapMonthOffset(a11: number): number {
	const k = Math.floor((a11 - EPOCH) / SYNODIC_MONTH + 0.5);
	let last: number;
	let i = 1;
	let arc = sunLong12(newMoonDay(k + i));
	do {
		last = arc;
		i++;
		arc = sunLong12(newMoonDay(k + i));
	} while (arc !== last && i < 14);
	return i - 1;
}

/** Convert a Gregorian date to the Vietnamese lunar calendar. */
export function solarToLunar(date: Date): LunarDate {
	const dd = date.getDate();
	const mm = date.getMonth() + 1;
	const yy = date.getFullYear();
	const dayNumber = jdFromDate(dd, mm, yy);
	const k = Math.floor((dayNumber - EPOCH) / SYNODIC_MONTH);
	let monthStart = newMoonDay(k + 1);
	if (monthStart > dayNumber) monthStart = newMoonDay(k);
	let a11 = lunarMonth11(yy);
	let b11 = a11;
	let lunarYear: number;
	if (a11 >= monthStart) {
		lunarYear = yy;
		a11 = lunarMonth11(yy - 1);
	} else {
		lunarYear = yy + 1;
		b11 = lunarMonth11(yy + 1);
	}
	const lunarDay = dayNumber - monthStart + 1;
	const diff = Math.floor((monthStart - a11) / 29);
	let leap = false;
	let lunarMonth = diff + 11;
	if (b11 - a11 > 365) {
		const lmo = leapMonthOffset(a11);
		if (diff >= lmo) {
			lunarMonth = diff + 10;
			if (diff === lmo) leap = true;
		}
	}
	if (lunarMonth > 12) lunarMonth -= 12;
	if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
	return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

/** Sexagenary year name, e.g. 2026 → "Bính Ngọ". */
export function canChiYear(lunarYear: number): string {
	return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`;
}

export function dayAdvice(lunarDay: number): DayAdvice {
	if (STRICT_FAST_DAYS.includes(lunarDay)) return 'strict';
	if (FAST_DAYS.includes(lunarDay)) return 'fast';
	return 'regular';
}

/** Hoàng đạo (auspicious) vs hắc đạo day, derived from the day's earthly branch and lunar month. */
export function isAuspiciousDay(date: Date, lunarMonth: number): boolean {
	const branch = (jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear()) + 1) % 12;
	return '110011010010'[(branch - ((lunarMonth - 1) % 6) * 2 + 12) % 12] === '1';
}

/** Earthly-branch name (Tý…Hợi) for an index 0–11. */
export function chiName(index: number): string {
	return CHI[index % 12];
}

/** Earthly-branch index (0 = Tý) of the day itself. */
export function dayBranch(date: Date): number {
	return (jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear()) + 1) % 12;
}

/** Branch indices of the six hoàng đạo hours for a day branch (standard "lục hoàng đạo" table). */
const GOOD_HOURS_BY_DAY_BRANCH = [
	[0, 1, 3, 6, 8, 9], // Tý, Ngọ
	[2, 3, 5, 8, 10, 11], // Sửu, Mùi
	[0, 1, 4, 5, 7, 10], // Dần, Thân
	[0, 2, 3, 6, 7, 9], // Mão, Dậu
	[2, 4, 5, 8, 9, 11], // Thìn, Tuất
	[1, 4, 6, 7, 10, 11] // Tỵ, Hợi
] as const;

/** The six auspicious two-hour slots of a day, as branch indices in order. */
export function goodHourBranches(date: Date): readonly number[] {
	return GOOD_HOURS_BY_DAY_BRANCH[dayBranch(date) % 6];
}

/** Start/end clock hours (0–23) of a branch's two-hour slot, e.g. Tý → 23–1. */
export function branchHours(index: number): { from: number; to: number } {
	return { from: (23 + 2 * index) % 24, to: (1 + 2 * index) % 24 };
}

function jdToDate(jd: number): Date {
	let b: number;
	let c: number;
	if (jd > 2299160) {
		const a = jd + 32044;
		b = Math.floor((4 * a + 3) / 146097);
		c = a - Math.floor((b * 146097) / 4);
	} else {
		b = 0;
		c = jd + 32082;
	}
	const d = Math.floor((4 * c + 3) / 1461);
	const e = c - Math.floor((1461 * d) / 4);
	const mo = Math.floor((5 * e + 2) / 153);
	return new Date(
		b * 100 + d - 4800 + Math.floor(mo / 10),
		mo + 3 - 12 * Math.floor(mo / 10) - 1,
		e - Math.floor((153 * mo + 2) / 5) + 1
	);
}

/**
 * Gregorian date of a (non-leap) lunar day. A day-30 request falls back to day 29 when that
 * lunar month is short. Returns `null` if the month does not exist.
 */
export function lunarToSolar(day: number, month: number, year: number): Date | null {
	let a11: number;
	let b11: number;
	if (month < 11) {
		a11 = lunarMonth11(year - 1);
		b11 = lunarMonth11(year);
	} else {
		a11 = lunarMonth11(year);
		b11 = lunarMonth11(year + 1);
	}
	const k = Math.floor(0.5 + (a11 - EPOCH) / SYNODIC_MONTH);
	let off = month - 11;
	if (off < 0) off += 12;
	if (b11 - a11 > 365) {
		const leapOffset = leapMonthOffset(a11);
		if (off >= leapOffset) off += 1;
	}
	const monthStart = newMoonDay(k + off);
	for (let d = day; d === day || d >= 29; d--) {
		const date = jdToDate(monthStart + d - 1);
		const lunar = solarToLunar(date);
		if (lunar.day === d && lunar.month === month && !lunar.leap) return date;
	}
	return null;
}
