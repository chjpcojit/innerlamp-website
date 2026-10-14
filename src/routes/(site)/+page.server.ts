import { ApiError } from '$lib/server/api/client';
import { getTopArticles } from '$lib/server/api/articles';
import { getCalendarYear, listMonthItems } from '$lib/server/api/calendar';
import { getTopDeities } from '$lib/server/api/deities';
import { getTopGallery } from '$lib/server/api/gallery';
import { getTopTemples } from '$lib/server/api/temples';
import { getMe, profileDisplayName } from '$lib/server/api/users';
import { TOKEN_COOKIE, setDisplayName } from '$lib/server/auth/session';
import type { PageServerLoad } from './$types';

/** Year and month (1–12) right now in Vietnam, which is how the backend defines "this year". */
function vietnamYearMonth() {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Ho_Chi_Minh',
		year: 'numeric',
		month: 'numeric'
	}).formatToParts(new Date());
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
	return { year: get('year'), month: get('month') };
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
	// The calendar API needs the user's token, so guests get no events (`null`).
	if (!locals.user || !token)
		return {
			user: locals.user,
			events: null,
			buddhas: await buddhas,
			temples: await temples,
			gallery: await gallery,
			articles: await articles
		};

	const { year, month } = vietnamYearMonth();
	const [profile, calendar] = await Promise.allSettled([
		getMe(fetch, token),
		getCalendarYear(fetch, token, year)
	]);

	// Never break the home page over the backend: fall back to what we have.
	for (const result of [profile, calendar]) {
		if (result.status === 'rejected' && !(result.reason instanceof ApiError)) throw result.reason;
	}

	const events = calendar.status === 'fulfilled' ? listMonthItems(calendar.value, month) : null;

	if (profile.status === 'rejected')
		return {
			user: locals.user,
			events,
			buddhas: await buddhas,
			temples: await temples,
			gallery: await gallery,
			articles: await articles
		};
	const name = profileDisplayName(profile.value);
	if (name !== locals.user.name) setDisplayName(cookies, name);
	return {
		user: { name },
		events,
		buddhas: await buddhas,
		temples: await temples,
		gallery: await gallery,
		articles: await articles
	};
};
