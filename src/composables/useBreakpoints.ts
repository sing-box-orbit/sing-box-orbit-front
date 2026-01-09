import { useMediaQuery } from '@vueuse/core';
import { computed } from 'vue';

// Element Plus breakpoints
// xs: <768px (mobile)
// sm: ≥768px (tablet)
// md: ≥992px (small desktop)
// lg: ≥1200px (desktop)
// xl: ≥1920px (large desktop)

const isXs = useMediaQuery('(max-width: 767px)');
const isSm = useMediaQuery('(min-width: 768px) and (max-width: 991px)');
const isMd = useMediaQuery('(min-width: 992px) and (max-width: 1199px)');
const isLg = useMediaQuery('(min-width: 1200px) and (max-width: 1919px)');
const isXl = useMediaQuery('(min-width: 1920px)');

// Cumulative breakpoints (includes larger sizes)
const isSmAndUp = useMediaQuery('(min-width: 768px)');
const isMdAndUp = useMediaQuery('(min-width: 992px)');
const isLgAndUp = useMediaQuery('(min-width: 1200px)');

// Aliases
const isMobile = isXs;
const isTablet = isSm;
const isDesktop = isMdAndUp;

export function useBreakpoints() {
	const dialogWidth = computed(() => {
		if (isXs.value) return '95%';
		if (isSm.value) return '80%';
		return '500px';
	});

	const largeDialogWidth = computed(() => {
		if (isXs.value) return '95%';
		if (isSm.value) return '85%';
		return '600px';
	});

	return {
		// Exact breakpoints
		isXs,
		isSm,
		isMd,
		isLg,
		isXl,

		// Cumulative breakpoints
		isSmAndUp,
		isMdAndUp,
		isLgAndUp,

		// Aliases
		isMobile,
		isTablet,
		isDesktop,

		// Helpers
		dialogWidth,
		largeDialogWidth,
	};
}
