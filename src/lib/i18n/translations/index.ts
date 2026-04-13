import en from '../../../locale/en.json';
import ru from '../../../locale/ru.json';
import kz from '../../../locale/kz.json';

export type Locale = 'en' | 'ru' | 'kz';
export type TranslationKey = keyof typeof en;

export const translations: Record<Locale, Record<TranslationKey, string>> = {
	en,
	ru,
	kz
};
