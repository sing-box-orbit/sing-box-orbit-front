import elEn from 'element-plus/es/locale/lang/en';
import elRu from 'element-plus/es/locale/lang/ru';
import { createI18n } from 'vue-i18n';
import en from './locales/en';
import ru from './locales/ru';

const LOCALE_STORAGE_KEY = 'locale';
const SUPPORTED_LOCALES = ['en', 'ru'] as const;

export const elementPlusLocales = {
	en: elEn,
	ru: elRu,
} as const;

function getInitialLocale(): string {
	const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
	if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as (typeof SUPPORTED_LOCALES)[number])) {
		return savedLocale;
	}

	const browserLocales = navigator.languages || [navigator.language];
	for (const locale of browserLocales) {
		const lang = locale.split('-')[0] ?? '';
		if (SUPPORTED_LOCALES.includes(lang as (typeof SUPPORTED_LOCALES)[number])) {
			return lang;
		}
	}

	return 'en';
}

export const i18n = createI18n({
	legacy: false,
	locale: getInitialLocale(),
	fallbackLocale: 'en',
	messages: {
		en,
		ru,
	},
});
