<script setup lang="ts">
</script>

<template>
	<div :class="$style.layout">
		<slot />
	</div>
</template>

<style module>
.layout {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--el-bg-color-page);
}
</style>
