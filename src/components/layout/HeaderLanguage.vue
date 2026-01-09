<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import IconLanguage from '~icons/tabler/language';

const { locale } = useI18n();

const languages = [
	{ code: 'en', name: 'English' },
	{ code: 'ru', name: 'Русский' },
];

const setLanguage = (code: string) => {
	locale.value = code;
	localStorage.setItem('locale', code);
};
</script>

<template>
	<el-dropdown trigger="click" @command="setLanguage">
		<el-button :class="$style.button" text>
			<IconLanguage :class="$style.icon" />
		</el-button>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="lang in languages"
					:key="lang.code"
					:command="lang.code"
					:class="{ [$style.active]: lang.code === locale }"
				>
					{{ lang.name }}
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

.active {
	background: var(--el-color-primary-light-9);
	color: var(--el-color-primary);
}
</style>
