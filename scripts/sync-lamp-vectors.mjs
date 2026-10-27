// Copies the product spec's lamp test vectors from an innerlamp-be checkout into
// tests/vectors/lamp/ and records the source commit. The pin is never edited by hand.
// Usage: node scripts/sync-lamp-vectors.mjs [path-to-innerlamp-be]   (or INNERLAMP_BE=...)
// Default checkout: ../innerlamp-be. lamp-lighter-name.json is not copied: the website shows the name the backend decided.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FILES = ['lamp-input-validation.json', 'lamp-remaining-label.json', 'lamp-lifetime.json'];
const source = resolve(process.argv[2] ?? process.env.INNERLAMP_BE ?? '../innerlamp-be');
const rules = join(source, 'docs/product/lamp/rules');
const target = resolve('tests/vectors/lamp');

mkdirSync(target, { recursive: true });
for (const name of FILES) copyFileSync(join(rules, name), join(target, name));

const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {
	encoding: 'utf8'
}).trim();
writeFileSync(
	join(target, 'SOURCE.json'),
	JSON.stringify(
		{ repo: 'innerlamp-be', path: 'docs/product/lamp/rules', commit, files: FILES },
		null,
		2
	) + '\n'
);
console.log(`Pinned ${FILES.length} vector files from ${source} @ ${commit}`);
