<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import HeaderLanguage from '@/components/layout/HeaderLanguage.vue'
import HeaderTheme from '@/components/layout/HeaderTheme.vue'
import HeaderUserMenu from '@/components/layout/HeaderUserMenu.vue'
import { useSidebar } from '@/composables/useSidebar'
import IconCircle from '~icons/tabler/circle'
import IconCircleFilled from '~icons/tabler/circle-filled'
import IconMenu2 from '~icons/tabler/menu-2'
import IconSmartHome from '~icons/tabler/smart-home'
import IconUsers from '~icons/tabler/users'
import IconX from '~icons/tabler/x'

const { t } = useI18n()
const {
	isCollapsed,
	isExpanded,
	isMobile,
	isMobileMenuOpen,
	toggle,
	setHovered,
	toggleMobileMenu,
	closeMobileMenu,
	sidebarWidth,
	contentMargin,
} = useSidebar()
</script>

<template>
	<el-container :class="$style.container">
		<Transition name="fade">
			<div
				v-if="isMobile && isMobileMenuOpen"
				:class="$style.backdrop"
				@click="closeMobileMenu"
			/>
		</Transition>

		<el-aside
			:class="[$style.aside, { [$style.asideMobileOpen]: isMobile && isMobileMenuOpen }]"
			:style="{ width: isMobile ? 'var(--sidebar-width)' : sidebarWidth }"
			@mouseenter="!isMobile && setHovered(true)"
			@mouseleave="!isMobile && setHovered(false)"
		>
			<button v-if="!isMobile" :class="$style.sidebarToggle" @click="toggle">
				<IconCircleFilled v-if="!isCollapsed" :class="$style.toggleIcon" />
				<IconCircle v-else :class="$style.toggleIcon" />
			</button>

			<button v-if="isMobile" :class="$style.mobileClose" @click="closeMobileMenu">
				<IconX />
			</button>

			<el-menu
				:class="$style.menu"
				:default-active="$route.path"
				:collapse="!isMobile && !isExpanded"
				:collapse-transition="false"
				router
				@select="isMobile && closeMobileMenu()"
			>
				<el-menu-item index="/">
					<el-icon><IconSmartHome /></el-icon>
					<template #title>{{ t('nav.dashboard') }}</template>
				</el-menu-item>
				<el-menu-item index="/users">
					<el-icon><IconUsers /></el-icon>
					<template #title>{{ t('nav.users') }}</template>
				</el-menu-item>
			</el-menu>
		</el-aside>

		<el-container :class="$style.mainWrapper" :style="{ '--current-sidebar-width': contentMargin }">
			<el-header :class="$style.header">
				<div :class="$style.headerLeft">
					<button v-if="isMobile" :class="$style.hamburger" @click="toggleMobileMenu">
						<IconMenu2 />
					</button>
				</div>

				<div :class="$style.headerRight">
					<HeaderLanguage />
					<HeaderTheme />
					<HeaderUserMenu />
				</div>
			</el-header>

			<el-main :class="$style.main">
				<slot />
			</el-main>
		</el-container>
	</el-container>
</template>

<style module>
.container {
	min-height: 100vh;
}

.backdrop {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
}

.aside {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	background: var(--el-bg-color);
	border-right: 1px solid var(--el-border-color);
	overflow: visible;
	transition:
		width 0.3s,
		transform 0.3s;
	display: flex;
	flex-direction: column;
	z-index: 1000;
}

@media (max-width: 991px) {
	.aside {
		transform: translateX(-100%);
	}

	.asideMobileOpen {
		transform: translateX(0);
	}
}

.sidebarToggle {
	position: absolute;
	top: 22px;
	right: -12px;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: var(--el-bg-color);
	border: 1px solid var(--el-border-color);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: var(--el-color-primary);
	transition: all 0.2s;
	z-index: 1001;
	padding: 0;
}

.sidebarToggle:hover {
	background: var(--el-color-primary);
	border-color: var(--el-color-primary);
	color: #fff;
}

.toggleIcon {
	width: 10px;
	height: 10px;
}

.mobileClose {
	position: absolute;
	top: 16px;
	right: 16px;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	background: transparent;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: var(--el-text-color-regular);
	transition: all 0.2s;
	z-index: 1001;
	padding: 0;
}

.mobileClose:hover {
	background: var(--el-fill-color);
	color: var(--el-text-color-primary);
}

.mobileClose svg {
	width: 20px;
	height: 20px;
}

.hamburger {
	width: 36px;
	height: 36px;
	border-radius: 6px;
	background: transparent;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: var(--el-text-color-regular);
	transition: all 0.2s;
	padding: 0;
}

.hamburger:hover {
	background: var(--el-fill-color);
	color: var(--el-text-color-primary);
}

.hamburger svg {
	width: 22px;
	height: 22px;
}

.menu {
	border-right: none;
	flex: 1;
	padding: 56px 12px 12px;
	overflow-y: auto;
}

.menu :global(.el-menu-item) {
	border-radius: 8px;
	margin-bottom: 4px;
	height: 44px;
}

.menu :global(.el-menu-item.is-active) {
	background: var(--el-color-primary-light-9);
}

.menu :global(.el-menu--collapse) {
	width: 100%;
	padding: 12px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.menu :global(.el-menu--collapse .el-menu-item) {
	width: 44px !important;
	min-width: 44px !important;
	padding: 0 !important;
	margin: 0 0 4px 0 !important;
	display: flex;
	justify-content: center;
	align-items: center;
}

.menu :global(.el-menu--collapse .el-menu-item .el-icon) {
	margin-right: 0;
}

.mainWrapper {
	flex: 1;
	flex-direction: column;
	margin-left: var(--current-sidebar-width, var(--sidebar-width));
	transition: margin-left 0.3s;
	min-height: 100vh;
}

.header {
	position: sticky;
	top: 0;
	z-index: 900;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--el-bg-color);
	border: 1px solid var(--el-border-color);
	border-radius: 8px;
	padding: 0 24px;
	height: var(--header-height);
	margin: 16px 24px 0;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

@media (max-width: 767px) {
	.header {
		margin: 8px 12px 0;
		padding: 0 12px;
	}
}

.headerLeft {
	display: flex;
	align-items: center;
}

.headerRight {
	display: flex;
	align-items: center;
	gap: 4px;
}

.main {
	background: var(--el-bg-color-page);
	padding: 24px;
	min-height: calc(100vh - var(--header-height));
}

@media (max-width: 767px) {
	.main {
		padding: 16px 12px;
	}
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.el-menu--collapse .el-menu-item {
	padding: 0 !important;
	justify-content: center !important;
}

.el-menu--collapse .el-menu-item .el-icon {
	margin-right: 0 !important;
	width: 24px;
	text-align: center;
}

.el-menu--collapse .el-tooltip__trigger {
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
	width: 100% !important;
	padding: 0 !important;
}

.el-menu--collapse .el-menu-item.is-active::before {
	display: none !important;
}

.el-menu--collapse .el-menu-item.is-active {
	border-left: none !important;
}
</style>
