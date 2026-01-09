<script setup lang="ts">
import { type ThemeMode, useTheme } from '@/composables/useTheme';
import IconDeviceDesktop from '~icons/tabler/device-desktop';
import IconMoon from '~icons/tabler/moon';
import IconSun from '~icons/tabler/sun';

const { mode, isDark, setTheme } = useTheme();

const themes: { value: ThemeMode; label: string; icon: typeof IconSun }[] = [
	{ value: 'light', label: 'Light', icon: IconSun },
	{ value: 'dark', label: 'Dark', icon: IconMoon },
	{ value: 'auto', label: 'System', icon: IconDeviceDesktop },
];
</script>

<template>
	<el-dropdown trigger="click" @command="setTheme">
		<el-button :class="$style.button" text>
			<IconMoon v-if="isDark" :class="$style.icon" />
			<IconSun v-else :class="$style.icon" />
		</el-button>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="theme in themes"
					:key="theme.value"
					:command="theme.value"
					:class="{ [$style.active]: theme.value === mode }"
				>
					<component :is="theme.icon" :class="$style.itemIcon" />
					{{ theme.label }}
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<style module>
.button {
	width: 38px;
	height: 38px;
	border-radius: 8px;
	padding: 0;
}

.icon {
	width: 22px;
	height: 22px;
	color: var(--el-text-color-regular);
}

.button:hover .icon {
	color: var(--el-color-primary);
}

.itemIcon {
	width: 18px;
	height: 18px;
	margin-right: 8px;
}

.active {
	background: var(--el-color-primary-light-9);
	color: var(--el-color-primary);
}
</style>
