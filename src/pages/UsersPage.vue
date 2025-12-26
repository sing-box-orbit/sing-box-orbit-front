<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
	<div :class="$style.page">
		<h1>{{ t('nav.users') }}</h1>
	</div>
</template>

<style module>
.page {
	padding: 20px;
}
</style>
