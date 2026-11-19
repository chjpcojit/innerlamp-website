import { REMIND_LEADS, REMIND_TIMES } from '$lib/content/memorial';

export interface ReminderChoice {
	lead: number;
	time: string;
}

const LEAD_CHOICES: readonly number[] = REMIND_LEADS;
const TIME_CHOICES: readonly string[] = REMIND_TIMES;

const minutes = (time: string): number => {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
};

/**
 * Nearest UI choice for a reminder saved with older/looser values (FR-MEM-007).
 * Days: nearest lead; a tie picks the earlier reminder, i.e. the larger lead (2 → 3, 5 → 7).
 * Time: nearest clock time; a tie picks the earlier time (09:30 → 07:00); clamped to 06:00–19:00.
 * Returns `null` for a null reminder (off). / Lựa chọn gần nhất cho giá trị nhắc cũ.
 */
export function nearestReminderChoice(
	reminder: { days_before: number; time: string } | null | undefined
): ReminderChoice | null {
	if (!reminder) return null;

	const leadValue = Number.isFinite(reminder.days_before) ? reminder.days_before : 0;
	let lead = LEAD_CHOICES[0];
	let leadDistance = Infinity;
	for (const choice of LEAD_CHOICES) {
		const distance = Math.abs(choice - leadValue);
		// Tie → larger lead (an earlier reminder); `>` keeps the larger of equal distances.
		if (distance < leadDistance || (distance === leadDistance && choice > lead)) {
			lead = choice;
			leadDistance = distance;
		}
	}

	const target = /^\d{2}:\d{2}$/.test(reminder.time) ? minutes(reminder.time) : minutes('07:00');
	let time = TIME_CHOICES[0];
	let timeDistance = Infinity;
	for (const choice of TIME_CHOICES) {
		const distance = Math.abs(minutes(choice) - target);
		// Tie → earlier time; `<=` lets a later iteration only win when strictly closer.
		if (distance < timeDistance) {
			time = choice;
			timeDistance = distance;
		}
	}

	return { lead, time };
}
