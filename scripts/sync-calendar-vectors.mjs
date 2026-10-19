// Copies the product spec's calendar test vectors from an innerlamp-be checkout into
// tests/vectors/calendar/ and records the source commit. The pin is never edited by hand.
// Usage: node scripts/sync-calendar-vectors.mjs [path-to-innerlamp-be]   (or INNERLAMP_BE=...)
// Default checkout: ../innerlamp-be. event-placement.json belongs to the backend and is not copied.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FILES = ['countdown.json', 'ordering.json'];
const source = resolve(process.argv[2] ?? process.env.INNERLAMP_BE ?? '../innerlamp-be');
const rules = join(source, 'docs/product/calendar/rules');
const target = resolve('tests/vectors/calendar');

mkdirSync(target, { recursive: true });
for (const name of FILES) copyFileSync(join(rules, name), join(target, name));

const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {
	encoding: 'utf8'
}).trim();
writeFileSync(
	join(target, 'SOURCE.json'),
	JSON.stringify(
		{ repo: 'innerlamp-be', path: 'docs/product/calendar/rules', commit, files: FILES },
		null,
		2
	) + '\n'
);
console.log(`Pinned ${FILES.length} vector files from ${source} @ ${commit}`);
