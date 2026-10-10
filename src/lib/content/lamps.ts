import { m } from '$lib/paraglide/messages';

/** Lamp offering: vessel styles, intentions and placeholder "garden" data from the design mock. */

export interface LampType {
	name: () => string;
	/** CSS background of the vessel. */
	cup: string;
	/** Width multiplier relative to the oil lamp. */
	width: number;
	radius: string;
	/** Extra decoration under the flame. */
	kind: 'oil' | 'lotus' | 'float';
}

export const LAMP_TYPES: LampType[] = [
	{
		name: () => m.lamp_type_oil(),
		cup: 'linear-gradient(180deg,#C99A4A,#7A5320)',
		width: 1,
		radius: '0 0 60px 60px / 0 0 46px 46px',
		kind: 'oil'
	},
	{
		name: () => m.lamp_type_lotus(),
		cup: 'linear-gradient(180deg,#E9B8B0,#A86A62)',
		width: 0.82,
		radius: '42% 42% 20px 20px / 30% 30% 20px 20px',
		kind: 'lotus'
	},
	{
		name: () => m.lamp_type_float(),
		cup: 'linear-gradient(180deg,#F0C26A,#B5762A)',
		width: 1.15,
		radius: '50% 50% 50% 50% / 20% 20% 80% 80%',
		kind: 'float'
	}
];

export const LAMP_PURPOSES: (() => string)[] = [
	() => m.lamp_for_0(),
	() => m.lamp_for_1(),
	() => m.lamp_for_2(),
	() => m.lamp_for_3()
];

export const LAMP_DAYS = [1, 7, 21, 49] as const;
export const DEFAULT_LAMP_DAYS = 1;

/** Lamps lit by other visitors before the viewer's own are added. */
export const LAMP_BASE_COUNT = 1284;
export const WALL_PAGE_SIZE = 12;

export interface WallLamp {
	who: string;
	/** Index into `LAMP_PURPOSES`. */
	purpose: number;
	to: () => string;
	daysLeft: number;
	/** Index into `LAMP_TYPES`. */
	type: number;
	atTemple: boolean;
}

const wall = (
	who: string,
	purpose: number,
	to: () => string,
	daysLeft: number,
	type: number,
	atTemple = false
): WallLamp => ({ who, purpose, to, daysLeft, type, atTemple });

export const WALL_LAMPS: WallLamp[] = [
	wall('Diệu Tâm', 0, () => m.lamp_wall_to_0(), 6, 0, true),
	wall('Minh Đăng', 1, () => m.lamp_wall_to_1(), 20, 2),
	wall('Tịnh An', 2, () => m.lamp_wall_to_2(), 41, 1),
	wall('Quảng Tâm', 0, () => m.lamp_wall_to_3(), 3, 1),
	wall('Thiện Từ', 3, () => m.lamp_wall_to_4(), 12, 0, true),
	wall('Tâm Như', 0, () => m.lamp_wall_to_5(), 1, 2),
	wall('Nhuận Hòa', 1, () => m.lamp_wall_to_6(), 18, 1),
	wall('An Lạc', 2, () => m.lamp_wall_to_7(), 47, 2),
	wall('Chơn Giác', 3, () => m.lamp_wall_to_8(), 9, 0),
	wall('Diệu Hạnh', 0, () => m.lamp_wall_to_9(), 21, 1, true),
	wall('Minh Tâm', 2, () => m.lamp_wall_to_10(), 33, 0, true),
	wall('Thiện Hòa', 1, () => m.lamp_wall_to_11(), 5, 2),
	wall('Quảng Đức', 0, () => m.lamp_wall_to_12(), 14, 0),
	wall('Tịnh Liên', 3, () => m.lamp_wall_to_13(), 2, 1),
	wall('Hạnh Nguyên', 0, () => m.lamp_wall_to_14(), 7, 2),
	wall('Viên Minh', 2, () => m.lamp_wall_to_15(), 49, 1)
];
