import { describe, expect, it, vi } from 'vitest';
import { currentPhotoUrl } from './memorial-photo';

describe('currentPhotoUrl', () => {
	it('reads the current URL on every call, so replaced/deleted photos are not stale', async () => {
		const lookup = vi
			.fn()
			.mockResolvedValueOnce({ photo_url: 'https://storage.example/old' })
			.mockResolvedValueOnce({ photo_url: 'https://storage.example/new' })
			.mockResolvedValueOnce({ photo_url: null });

		await expect(currentPhotoUrl(lookup)).resolves.toBe('https://storage.example/old');
		await expect(currentPhotoUrl(lookup)).resolves.toBe('https://storage.example/new');
		await expect(currentPhotoUrl(lookup)).resolves.toBeNull();
		expect(lookup).toHaveBeenCalledTimes(3);
	});
});
