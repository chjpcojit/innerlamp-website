import { m } from '$lib/paraglide/messages';
import { findTemple } from '$lib/content/temples';

export interface Crumb {
	label: () => string;
	/** Locale-free path; omitted for the current page. */
	href?: string;
}

export interface SubNav {
	crumbs: Crumb[];
	/** Sibling pages of the same section, shown as pills. */
	tabs: { href: string; label: () => string }[];
}

const home: Crumb = { label: () => m.nav_home(), href: '/' };

const CALENDAR_TABS = [
	{ href: '/lunar', label: () => m.crumb_month() },
	{ href: '/events', label: () => m.crumb_events() }
];

const ME_TABS = [
	{ href: '/profile', label: () => m.crumb_overview() },
	{ href: '/notifications', label: () => m.notif_title() },
	{ href: '/settings', label: () => m.set_title() },
	{ href: '/memorial', label: () => m.mem_title() }
];

const SUPPORT_TABS = [
	{ href: '/help', label: () => m.help_meta_title() },
	{ href: '/support', label: () => m.sup_meta_title() },
	{ href: '/contact', label: () => m.contact_meta_title() },
	{ href: '/terms', label: () => m.legal_terms_meta_title() },
	{ href: '/privacy', label: () => m.legal_privacy_meta_title() }
];

const me: Crumb = { label: () => m.crumb_me(), href: '/profile' };
const memorialBook: Crumb = { label: () => m.mem_title(), href: '/memorial' };

const calendar: Crumb = { label: () => m.nav_lunar(), href: '/lunar' };

/** Breadcrumb trail (and section tabs) per locale-free path, mirroring the prototype's `subNav`. */
const SUBNAV: Record<string, SubNav> = {
	'/library': { crumbs: [{ label: () => m.nav_library() }], tabs: [] },
	'/library/buddhas': { crumbs: [home, { label: () => m.buddhas_title() }], tabs: [] },
	'/library/talks': { crumbs: [home, { label: () => m.talks_title() }], tabs: [] },
	'/articles': { crumbs: [home, { label: () => m.articles_title() }], tabs: [] },
	'/gallery': { crumbs: [home, { label: () => m.gallery_title() }], tabs: [] },
	'/temples': { crumbs: [home, { label: () => m.temples_title() }], tabs: [] },
	'/practice': { crumbs: [{ label: () => m.nav_practice() }], tabs: [] },
	'/practice/lamp': {
		crumbs: [
			{ label: () => m.nav_practice(), href: '/practice' },
			{ label: () => m.lamp_meta_title() }
		],
		tabs: []
	},
	'/offer': { crumbs: [home, { label: () => m.offer_meta_title() }], tabs: [] },
	'/help': { crumbs: [home, { label: () => m.help_meta_title() }], tabs: SUPPORT_TABS },
	'/support': { crumbs: [home, { label: () => m.sup_meta_title() }], tabs: SUPPORT_TABS },
	'/contact': { crumbs: [home, { label: () => m.contact_meta_title() }], tabs: SUPPORT_TABS },
	'/terms': { crumbs: [home, { label: () => m.legal_terms_meta_title() }], tabs: SUPPORT_TABS },
	'/privacy': { crumbs: [home, { label: () => m.legal_privacy_meta_title() }], tabs: SUPPORT_TABS },
	'/merit': { crumbs: [home, { label: () => m.mr_meta_title() }], tabs: [] },
	'/lunar': { crumbs: [{ label: calendar.label }], tabs: CALENDAR_TABS },
	'/profile': { crumbs: [{ label: me.label }], tabs: ME_TABS },
	'/notifications': { crumbs: [me, { label: () => m.notif_title() }], tabs: ME_TABS },
	'/settings': { crumbs: [me, { label: () => m.set_title() }], tabs: ME_TABS },
	'/memorial': { crumbs: [me, { label: () => m.mem_title() }], tabs: ME_TABS },
	'/memorial/new': {
		crumbs: [me, memorialBook, { label: () => m.mem_form_add() }],
		tabs: ME_TABS
	},
	'/lunar/day': {
		crumbs: [calendar, { label: () => m.day_meta_title() }],
		tabs: CALENDAR_TABS
	},
	'/events': { crumbs: [calendar, { label: () => m.crumb_events() }], tabs: CALENDAR_TABS }
};

export function getSubNav(path: string): SubNav | undefined {
	const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
	if (/^\/memorial\/(?!new$)[^/]+$/.test(clean)) {
		return { crumbs: [me, memorialBook, { label: () => m.mem_form_edit() }], tabs: ME_TABS };
	}
	const temple = /^\/temples\/([^/]+)$/.exec(clean);
	if (temple) {
		const t = findTemple(temple[1]);
		if (t) {
			return {
				crumbs: [
					home,
					{ label: () => m.temples_title(), href: '/temples' },
					{ label: () => t.name() }
				],
				tabs: []
			};
		}
	}
	return SUBNAV[clean];
}
