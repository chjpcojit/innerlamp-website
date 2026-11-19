import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ env: {} as Record<string, string | undefined> }));
vi.mock('$env/dynamic/private', () => ({ env: state.env }));

import { memorialPhotoEnabled } from './memorial-config';

afterEach(() => {
	delete state.env.MEMORIAL_PHOTO_ENABLED;
});

describe('memorialPhotoEnabled', () => {
	it('is on when the environment does not set the switch', () => {
		expect(memorialPhotoEnabled()).toBe(true);
	});

	it('keeps an explicit false as the kill switch', () => {
		state.env.MEMORIAL_PHOTO_ENABLED = 'false';
		expect(memorialPhotoEnabled()).toBe(false);
	});

	it('is on only for the exact string true when set', () => {
		state.env.MEMORIAL_PHOTO_ENABLED = 'true';
		expect(memorialPhotoEnabled()).toBe(true);
		state.env.MEMORIAL_PHOTO_ENABLED = '1';
		expect(memorialPhotoEnabled()).toBe(false);
	});
});
