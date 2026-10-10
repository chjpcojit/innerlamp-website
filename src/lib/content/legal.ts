import { m } from '$lib/paraglide/messages';

/** Legal documents (terms of use, privacy policy), from the prototype's `LEGAL` table. */

export type LegalKind = 'terms' | 'privacy';

export interface LegalSection {
	title: () => string;
	paragraphs: (() => string)[];
}

export interface LegalDoc {
	title: () => string;
	intro: () => string;
	/** Topic phrase for the "questions about …? Send them to the Contact page" footer. */
	question: () => string;
	sections: LegalSection[];
}

export const LEGAL_DOCS: Record<LegalKind, LegalDoc> = {
	terms: {
		title: () => m.legal_terms_title(),
		intro: () => m.legal_terms_intro(),
		question: () => m.legal_question_terms(),
		sections: [
			{ title: () => m.legal_terms_s1_title(), paragraphs: [() => m.legal_terms_s1_p1()] },
			{
				title: () => m.legal_terms_s2_title(),
				paragraphs: [() => m.legal_terms_s2_p1(), () => m.legal_terms_s2_p2()]
			},
			{ title: () => m.legal_terms_s3_title(), paragraphs: [() => m.legal_terms_s3_p1()] },
			{
				title: () => m.legal_terms_s4_title(),
				paragraphs: [() => m.legal_terms_s4_p1(), () => m.legal_terms_s4_p2()]
			},
			{ title: () => m.legal_terms_s5_title(), paragraphs: [() => m.legal_terms_s5_p1()] },
			{ title: () => m.legal_terms_s6_title(), paragraphs: [() => m.legal_terms_s6_p1()] },
			{ title: () => m.legal_terms_s7_title(), paragraphs: [() => m.legal_terms_s7_p1()] }
		]
	},
	privacy: {
		title: () => m.legal_privacy_title(),
		intro: () => m.legal_privacy_intro(),
		question: () => m.legal_question_privacy(),
		sections: [
			{
				title: () => m.legal_privacy_s1_title(),
				paragraphs: [
					() => m.legal_privacy_s1_p1(),
					() => m.legal_privacy_s1_p2(),
					() => m.legal_privacy_s1_p3()
				]
			},
			{ title: () => m.legal_privacy_s2_title(), paragraphs: [() => m.legal_privacy_s2_p1()] },
			{
				title: () => m.legal_privacy_s3_title(),
				paragraphs: [() => m.legal_privacy_s3_p1(), () => m.legal_privacy_s3_p2()]
			},
			{ title: () => m.legal_privacy_s4_title(), paragraphs: [() => m.legal_privacy_s4_p1()] },
			{ title: () => m.legal_privacy_s5_title(), paragraphs: [() => m.legal_privacy_s5_p1()] },
			{ title: () => m.legal_privacy_s6_title(), paragraphs: [() => m.legal_privacy_s6_p1()] }
		]
	}
};
