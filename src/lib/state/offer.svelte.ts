import {
	CUSTOM_AMOUNT,
	DEFAULT_OFFER_AMOUNT,
	MIN_OFFER_AMOUNT,
	OFFER_PURPOSES,
	OFFER_TEMPLES
} from '$lib/content/offer';

export type OfferStep = 'form' | 'qr' | 'done';
export type OfferError = 'amount' | 'name';

export interface OfferInit {
	temple?: number;
	purpose?: number;
	amount?: number;
	name?: string;
	wish?: string;
}

const QR_SIZE = 25;

/** State of the three-step offering flow (form → transfer code → thank-you). One instance per visit. */
export class OfferFlow {
	step = $state<OfferStep>('form');
	temple = $state(0);
	purpose = $state(0);
	/** Preset amount in đồng, or `CUSTOM_AMOUNT` to use `custom`. */
	preset = $state<number>(DEFAULT_OFFER_AMOUNT);
	custom = $state('');
	name = $state('');
	anonymous = $state(false);
	wish = $state('');
	monthly = $state(false);
	error = $state<OfferError | null>(null);

	constructor(init: OfferInit = {}) {
		this.temple = init.temple ?? 0;
		this.purpose = init.purpose ?? 0;
		this.preset = init.amount ?? DEFAULT_OFFER_AMOUNT;
		this.name = init.name ?? '';
		this.wish = init.wish ?? '';
	}

	get amount(): number {
		return this.preset === CUSTOM_AMOUNT
			? parseInt(this.custom.replace(/\D/g, ''), 10) || 0
			: this.preset;
	}

	/** Reference the temple uses to match the transfer, e.g. `IL01234 THINH DEN`. */
	get memo(): string {
		const n = ((this.temple + 1) * 7919 + this.purpose * 131 + this.amount) % 99991;
		return `IL${String(n).padStart(5, '0')} ${OFFER_PURPOSES[this.purpose].memo}`;
	}

	/**
	 * Placeholder QR pattern (deterministic per temple / purpose / amount). It is NOT a scannable
	 * VietQR payload — replace with a backend-issued code.
	 */
	get qr(): boolean[] {
		const cells: boolean[] = [];
		let seed = this.amount + this.temple * 97 + this.purpose * 13 + 7;
		const finder = (x: number, y: number, cx: number, cy: number) => {
			const dx = x - cx;
			const dy = y - cy;
			if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
			return (
				dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
			);
		};
		for (let y = 0; y < QR_SIZE; y++) {
			for (let x = 0; x < QR_SIZE; x++) {
				let v = finder(x, y, 0, 0) ?? finder(x, y, 18, 0) ?? finder(x, y, 0, 18);
				if (v === null) {
					if (
						((x === 7 || y === 7) && x < 8 && y < 8) ||
						(x === 17 && y < 8) ||
						(y === 17 && x < 8)
					) {
						v = false;
					} else {
						seed = (seed * 1103515245 + 12345) & 0x7fffffff;
						v = seed % 100 < 47;
					}
				}
				cells.push(v);
			}
		}
		return cells;
	}

	get templeInfo() {
		return OFFER_TEMPLES[this.temple];
	}

	/** Validate the form and move to the transfer step; returns whether it advanced. */
	next(): boolean {
		if (this.amount < MIN_OFFER_AMOUNT) {
			this.error = 'amount';
			return false;
		}
		if (!this.anonymous && !this.name.trim()) {
			this.error = 'name';
			return false;
		}
		this.error = null;
		this.step = 'qr';
		return true;
	}

	back() {
		this.step = 'form';
	}

	finish() {
		this.step = 'done';
	}

	/** "Offer more": back to an empty form, keeping temple / purpose / name. */
	reset() {
		this.step = 'form';
		this.wish = '';
		this.preset = DEFAULT_OFFER_AMOUNT;
		this.custom = '';
	}
}
