import { m } from '$lib/paraglide/messages';

export type BuddhaGroup = 'buddha' | 'bodhisattva';

export interface BuddhaItem {
	id: string;
	name: () => string;
	kind: () => string;
	group: BuddhaGroup;
	role: () => string;
	/** Lunar feast day, `dd/mm`. */
	via: string;
}

const buddha = () => m.buddha_kind_buddha();
const bodhisattva = () => m.buddha_kind_bodhisattva();

/** Placeholder catalogue until the backend serves buddhas & bodhisattvas. */
export const BUDDHA_LIST: BuddhaItem[] = [
	{
		id: 'shakyamuni',
		name: () => m.buddha_1(),
		kind: buddha,
		group: 'buddha',
		role: () => m.buddha_1_role(),
		via: '15/04'
	},
	{
		id: 'amitabha',
		name: () => m.buddha_2(),
		kind: buddha,
		group: 'buddha',
		role: () => m.buddha_2_role(),
		via: '17/11'
	},
	{
		id: 'medicine',
		name: () => m.buddha_3(),
		kind: buddha,
		group: 'buddha',
		role: () => m.buddha_3_role(),
		via: '30/09'
	},
	{
		id: 'maitreya',
		name: () => m.buddha_4(),
		kind: () => m.buddha_kind_future(),
		group: 'buddha',
		role: () => m.buddha_4_role(),
		via: '01/01'
	},
	{
		id: 'avalokitesvara',
		name: () => m.buddha_5(),
		kind: bodhisattva,
		group: 'bodhisattva',
		role: () => m.buddha_5_role(),
		via: '19/02'
	},
	{
		id: 'ksitigarbha',
		name: () => m.buddha_6(),
		kind: bodhisattva,
		group: 'bodhisattva',
		role: () => m.buddha_6_role(),
		via: '30/07'
	},
	{
		id: 'manjushri',
		name: () => m.buddha_7(),
		kind: bodhisattva,
		group: 'bodhisattva',
		role: () => m.buddha_7_role(),
		via: '04/04'
	},
	{
		id: 'samantabhadra',
		name: () => m.buddha_8(),
		kind: bodhisattva,
		group: 'bodhisattva',
		role: () => m.buddha_8_role(),
		via: '21/02'
	},
	{
		id: 'mahasthamaprapta',
		name: () => m.buddha_9(),
		kind: bodhisattva,
		group: 'bodhisattva',
		role: () => m.buddha_9_role(),
		via: '13/07'
	}
];
