import { ApiError } from '$lib/server/api/client';
import { getTopArticles } from '$lib/server/api/articles';
import { getCalendarYear, listCalendarEntries, toListItems } from '$lib/server/api/calendar';
import { getTopDeities } from '$lib/server/api/deities';
import { getTopGallery } from '$lib/server/api/gallery';
import { getTopTemples } from '$lib/server/api/temples';
import { getMe, profileDisplayName } from '$lib/server/api/users';
import { TOKEN_COOKIE, setDisplayName } from '$lib/server/auth/session';
import { vietnamToday, vietnamYearMonth } from '$lib/utils/calendar-time';
import { buildHomeBlock } from '$lib/utils/calendar-home';
import type { PageServerLoad } from './$types';

/**
 * The current month's card of the "Sự kiện Phật giáo" block (BR-CAL-15, current month only).
 * The calendar route is public, so everyone gets it. When the year cannot be loaded the card
 * is marked `failed` (it shows the failure and a retry); the block never breaks the page.
 */
async function loadHomeEvents(fetch: typeof globalThis.fetch) {
	const start = vietnamYearMonth();
	try {
		const { calendar, stale } = await getCalendarYear(fetch, start.year);
		const [month] = buildHomeBlock(
			toListItems(listCalendarEntries(calendar)),
			start,
			vietnamToday()
		);
		return { month, stale };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		const [month] = buildHomeBlock([], start, vietnamToday());
		return { month: { ...month, failed: true }, stale: false };
	}
}

/** Cards shown in the home page library section. */
const HOME_DEITY_COUNT = 6;

/** Featured Buddhas/Bodhisattvas; `null` on backend failure so the home page falls back to static content. */
async function loadTopDeities(fetch: typeof globalThis.fetch) {
	try {
		return (await getTopDeities(fetch)).items.slice(0, HOME_DEITY_COUNT);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return null;
	}
}

/** Cards shown in the home page temples section. */
const HOME_TEMPLE_COUNT = 7;

/** Featured temples; `null` on backend failure so the home page falls back to static content. */
async function loadTopTemples(fetch: typeof globalThis.fetch) {
	try {
		return (await getTopTemples(fetch)).items.slice(0, HOME_TEMPLE_COUNT);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return null;
	}
}

/** Tiles in the home page photo mosaic (its layout has four slots). */
const HOME_GALLERY_COUNT = 4;

/** Featured gallery photos; `null` on backend failure so the home page falls back to static content. */
async function loadTopGallery(fetch: typeof globalThis.fetch) {
	try {
		return (await getTopGallery(fetch)).items.slice(0, HOME_GALLERY_COUNT);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return null;
	}
}

/** Cards shown in the home page articles section. */
const HOME_ARTICLE_COUNT = 4;

/** Featured articles; `null` on backend failure so the home page falls back to static content. */
async function loadTopArticles(fetch: typeof globalThis.fetch) {
	try {
		return (await getTopArticles(fetch)).items.slice(0, HOME_ARTICLE_COUNT);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return null;
	}
}

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	const buddhas = loadTopDeities(fetch);
	const temples = loadTopTemples(fetch);
	const gallery = loadTopGallery(fetch);
	const articles = loadTopArticles(fetch);
	const events = loadHomeEvents(fetch);
	if (!locals.user || !token)
		return {
			user: locals.user,
			events: await events,
			buddhas: await buddhas,
			temples: await temples,
			gallery: await gallery,
			articles: await articles
		};

	const [profile] = await Promise.allSettled([getMe(fetch, token)]);

	// Never break the home page over the backend: fall back to what we have.
	if (profile.status === 'rejected' && !(profile.reason instanceof ApiError)) throw profile.reason;

	if (profile.status === 'rejected')
		return {
			user: locals.user,
			events: await events,
			buddhas: await buddhas,
			temples: await temples,
			gallery: await gallery,
			articles: await articles
		};
	const name = profileDisplayName(profile.value);
	if (name !== locals.user.name) setDisplayName(cookies, name);
	return {
		user: { name },
		events: await events,
		buddhas: await buddhas,
		temples: await temples,
		gallery: await gallery,
		articles: await articles
	};
};
