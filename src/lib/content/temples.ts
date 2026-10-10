import { m } from '$lib/paraglide/messages';
import { msg } from '$lib/utils/msg';

export type Region = 'north' | 'central' | 'south' | 'highlands';

export interface TempleItem {
	id: string;
	name: () => string;
	place: () => string;
	region: Region;
	rank: () => string;
	sect: () => string;
	/** True when the temple holds a heritage ranking (shown as "Di tích …"). */
	heritage: boolean;
	year: () => string;
	address: () => string;
	/** Opening hours; locale-neutral. */
	hours: string;
	intro: () => string;
	highlights: (() => string)[];
	/** Slug in `OFFER_TEMPLES`; only temples with a verified account accept offerings. */
	offerSlug?: string;
}

export const REGIONS: { id: Region; label: () => string }[] = [
	{ id: 'north', label: () => m.region_north() },
	{ id: 'central', label: () => m.region_central() },
	{ id: 'south', label: () => m.region_south() },
	{ id: 'highlands', label: () => m.region_highlands() }
];

const provincial = () => m.rank_provincial();
const national = () => m.rank_national();
const special = () => m.rank_special();
const unranked = () => m.rank_none();
const mahayana = () => m.sect_north();

type Base = Pick<TempleItem, 'id' | 'region' | 'rank' | 'sect' | 'hours' | 'offerSlug'> & {
	/** Index of the `temple_<n>_*` message set. */
	n: number;
};

function temple({ n, rank, ...rest }: Base): TempleItem {
	return {
		...rest,
		rank,
		name: () => msg(`temple_${n}_name`),
		place: () => msg(`temple_${n}_place`),
		heritage: rank !== unranked,
		year: () => msg(`temple_${n}_year`),
		address: () => msg(`temple_${n}_address`),
		intro: () => msg(`temple_${n}_intro`),
		highlights: [1, 2, 3].map((k) => () => msg(`temple_${n}_hl_${k}`))
	};
}

export function findTemple(id: string): TempleItem | undefined {
	return TEMPLE_LIST.find((t) => t.id === id);
}

/** Placeholder catalogue until the backend serves temples. */
export const TEMPLE_LIST: TempleItem[] = [
	temple({
		id: 'tu-quang',
		n: 1,
		region: 'south',
		rank: provincial,
		sect: mahayana,
		hours: '5:00 – 21:00',
		offerSlug: 'tuquang'
	}),
	temple({
		id: 'tran-quoc',
		n: 2,
		region: 'north',
		rank: national,
		sect: mahayana,
		hours: '7:30 – 18:00',
		offerSlug: 'tranquoc'
	}),
	temple({
		id: 'thien-mu',
		n: 3,
		region: 'central',
		rank: national,
		sect: mahayana,
		hours: '8:00 – 17:30'
	}),
	temple({
		id: 'bai-dinh',
		n: 4,
		region: 'north',
		rank: unranked,
		sect: mahayana,
		hours: '6:00 – 18:00'
	}),
	temple({
		id: 'mot-cot',
		n: 5,
		region: 'north',
		rank: special,
		sect: mahayana,
		hours: '7:00 – 18:00'
	}),
	temple({
		id: 'huong',
		n: 6,
		region: 'north',
		rank: special,
		sect: mahayana,
		hours: '6:00 – 18:00'
	}),
	temple({
		id: 'linh-ung',
		n: 7,
		region: 'central',
		rank: unranked,
		sect: mahayana,
		hours: '6:00 – 21:00'
	}),
	temple({
		id: 'truc-lam',
		n: 8,
		region: 'highlands',
		rank: unranked,
		sect: () => m.sect_truclam(),
		hours: '6:00 – 17:00',
		offerSlug: 'truclam'
	}),
	temple({
		id: 'vinh-nghiem',
		n: 9,
		region: 'south',
		rank: provincial,
		sect: mahayana,
		hours: '6:00 – 21:00',
		offerSlug: 'vinhnghiem'
	})
];
