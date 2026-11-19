import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ env: {} as Record<string, string | undefined> }));
vi.mock('$env/dynamic/private', () => ({ env: state.env }));

import { memorialPhotoEnabled } from './memorial-config';

afterEach(() => {
	delete state.env.MEMORIAL_PHOTO_ENABLED;
});

describe('memorialPhotoEnabled', () => {
	it('is off by default', () => {
		expect(memorialPhotoEnabled()).toBe(false);
	});

	it('is off for any value other than the exact string true', () => {
		state.env.MEMORIAL_PHOTO_ENABLED = '1';
		expect(memorialPhotoEnabled()).toBe(false);
	});

	it('is on only when explicitly true', () => {
		state.env.MEMORIAL_PHOTO_ENABLED = 'true';
		expect(memorialPhotoEnabled()).toBe(true);
	});
});
