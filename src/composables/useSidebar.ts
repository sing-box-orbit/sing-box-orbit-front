import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const isCollapsed = useLocalStorage('sidebar-collapsed', false)
const isHovered = ref(false)
const isMobileMenuOpen = ref(false)

const isMobile = useMediaQuery('(max-width: 991px)')

export function useSidebar() {
	const toggle = () => {
		isCollapsed.value = !isCollapsed.value
	}

	const collapse = () => {
		isCollapsed.value = true
	}

	const expand = () => {
		isCollapsed.value = false
	}

	const setHovered = (value: boolean) => {
		isHovered.value = value
	}

	const openMobileMenu = () => {
		isMobileMenuOpen.value = true
	}

	const closeMobileMenu = () => {
		isMobileMenuOpen.value = false
	}

	const toggleMobileMenu = () => {
		isMobileMenuOpen.value = !isMobileMenuOpen.value
	}

	watch(isMobile, (mobile) => {
		if (!mobile) {
			isMobileMenuOpen.value = false
		}
	})

	const isExpanded = computed(() => {
		if (isMobile.value) {
			return true
		}
		return !isCollapsed.value || isHovered.value
	})

	const sidebarWidth = computed(() => (isExpanded.value ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'))

	const contentMargin = computed(() => {
		if (isMobile.value) {
			return '0px'
		}
		return isCollapsed.value ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
	})

	return {
		isCollapsed,
		isHovered,
		isExpanded,
		isMobile,
		isMobileMenuOpen,
		toggle,
		collapse,
		expand,
		setHovered,
		openMobileMenu,
		closeMobileMenu,
		toggleMobileMenu,
		sidebarWidth,
		contentMargin,
	}
}
