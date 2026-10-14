import type { ItemList, NewWard, Province } from '$lib/types/administrative-unit';

// Browser side of the administrative-units proxy (`/api/administrative-units/*`).
// The backend rate-limits the group, so results are memoised for the page's lifetime.

let provinces: Promise<Province[]> | undefined;
const wards = new Map<string, Promise<NewWard[]>>();

async function load<T>(url: string): Promise<T[]> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(String(res.status));
	return ((await res.json()) as ItemList<T>).items;
}

const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, 'vi');

/** Drops a failed promise from the cache so the next call retries. */
function forgetOnFailure<T>(p: Promise<T>, forget: () => void): Promise<T> {
	p.catch(forget);
	return p;
}

export function fetchProvinces(): Promise<Province[]> {
	provinces ??= forgetOnFailure(
		load<Province>('/api/administrative-units/provinces').then((l) => l.sort(byName)),
		() => (provinces = undefined)
	);
	return provinces;
}

export function fetchWards(provinceCode: string): Promise<NewWard[]> {
	let p = wards.get(provinceCode);
	if (!p) {
		p = forgetOnFailure(
			load<NewWard>(
				`/api/administrative-units/provinces/${encodeURIComponent(provinceCode)}/wards`
			).then((l) => l.sort(byName)),
			() => wards.delete(provinceCode)
		);
		wards.set(provinceCode, p);
	}
	return p;
}

/** "Thành phố Hồ Chí Minh" with name "Hồ Chí Minh" → "Thành phố"; empty when no prefix. */
export function unitType(unit: { name: string; full_name: string }): string {
	return unit.full_name.endsWith(unit.name)
		? unit.full_name.slice(0, unit.full_name.length - unit.name.length).trim()
		: '';
}
