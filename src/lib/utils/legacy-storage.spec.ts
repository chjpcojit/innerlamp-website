import { describe, expect, it, vi } from 'vitest';
import { clearLegacyMemorial } from './legacy-storage';

describe('clearLegacyMemorial', () => {
	it('removes the old key and never writes anything', () => {
		const removeItem = vi.fn();
		const setItem = vi.fn();
		clearLegacyMemorial({ removeItem, setItem } as unknown as Storage);
		expect(removeItem).toHaveBeenCalledWith('il-memorial');
		expect(setItem).not.toHaveBeenCalled();
	});

	it('fails soft when storage throws', () => {
		expect(() =>
			clearLegacyMemorial({
				removeItem: () => {
					throw new Error('blocked');
				}
			} as unknown as Storage)
		).not.toThrow();
	});
});
