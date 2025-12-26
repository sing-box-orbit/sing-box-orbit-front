import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export function useTheme() {
	const mode = useColorMode({
		selector: 'html',
		attribute: 'class',
		modes: {
			light: '',
			dark: 'dark',
			auto: '',
		},
		storageKey: 'theme-mode',
	})

	const isDark = computed(() => {
		if (mode.value === 'auto') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
		}
		return mode.value === 'dark'
	})

	const setTheme = (theme: ThemeMode) => {
		mode.value = theme
	}

	return {
		mode,
		isDark,
		setTheme,
	}
}
