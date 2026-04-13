import { z } from 'zod';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const localeDir = __dirname;
const enPath = join(localeDir, 'en.json');
const enLocale: Record<string, string> = JSON.parse(readFileSync(enPath, 'utf-8'));

const translationKeys = Object.keys(enLocale) as [string, ...string[]];
const LocaleSchema = z.object(
	Object.fromEntries(translationKeys.map((key) => [key, z.string()]))
) as z.ZodObject<Record<string, z.ZodString>>;

type ValidationResult = {
	locale: string;
	valid: boolean;
	missingKeys: string[];
	emptyKeys: string[];
};

function getLocaleFiles(): string[] {
	return readdirSync(localeDir)
		.filter((file) => file.endsWith('.json'))
		.map((file) => file.replace('.json', ''));
}

function validateLocale(locale: string): ValidationResult {
	const localePath = join(localeDir, `${locale}.json`);
	let localeData: Record<string, string>;

	try {
		localeData = JSON.parse(readFileSync(localePath, 'utf-8'));
	} catch {
		return {
			locale,
			valid: false,
			missingKeys: translationKeys,
			emptyKeys: []
		};
	}

	const missingKeys: string[] = [];
	const emptyKeys: string[] = [];

	for (const key of translationKeys) {
		if (!(key in localeData)) {
			missingKeys.push(key);
		} else if (localeData[key] === '') {
			emptyKeys.push(key);
		}
	}

	const parseResult = LocaleSchema.safeParse(localeData);

	return {
		locale,
		valid: parseResult.success && missingKeys.length === 0,
		missingKeys,
		emptyKeys
	};
}

function main() {
	console.log('Validating locale files...\n');

	const locales = getLocaleFiles();
	const results: ValidationResult[] = [];
	let hasIssues = false;

	for (const locale of locales) {
		const result = validateLocale(locale);
		results.push(result);

		if (result.missingKeys.length > 0) {
			hasIssues = true;
		}
	}

	const totalKeys = translationKeys.length;

	for (const result of results) {
		const hasMissing = result.missingKeys.length > 0;
		const hasEmpty = result.emptyKeys.length > 0;
		const status = hasMissing ? '✗' : hasEmpty ? '⚠' : '✓';
		const translatedCount = totalKeys - result.missingKeys.length - result.emptyKeys.length;
		
		console.log(`${status} ${result.locale}.json (${translatedCount}/${totalKeys} translated)`);

		if (result.missingKeys.length > 0) {
			console.log(`  Missing keys (schema violation):`);
			for (const key of result.missingKeys) {
				console.log(`    - ${key}`);
			}
		}

		if (result.emptyKeys.length > 0) {
			console.log(`  Empty translations (will fallback to EN at runtime):`);
			for (const key of result.emptyKeys) {
				console.log(`    - ${key}`);
			}
		}

		console.log();
	}

	if (hasIssues) {
		console.log('✗ Validation failed: some locales have missing keys');
		process.exit(1);
	} else {
		const totalEmpty = results.reduce((acc, r) => acc + r.emptyKeys.length, 0);
		if (totalEmpty > 0) {
			console.log(`⚠ Validation passed with ${totalEmpty} empty translation(s) (EN fallback at runtime)`);
		} else {
			console.log('✓ All locales are complete');
		}
		process.exit(0);
	}
}

main();
