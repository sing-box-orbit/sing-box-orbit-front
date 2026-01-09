<script setup lang="ts" generic="T">
import type { Column } from 'element-plus';
import { ElAutoResizer, ElTableV2 } from 'element-plus';
import { computed, ref } from 'vue';

interface Props {
	data: T[];
	columns: Column<T>[];
	loading?: boolean;
	rowHeight?: number;
	headerHeight?: number;
	minHeight?: number;
	maxHeight?: number;
	rowKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	rowHeight: 50,
	headerHeight: 50,
	minHeight: 300,
	maxHeight: 600,
	rowKey: 'id',
});

const tableHeight = computed(() => {
	const contentHeight = props.data.length * props.rowHeight + props.headerHeight;
	return Math.min(Math.max(contentHeight, props.minHeight), props.maxHeight);
});

const containerWidth = ref(0);

const totalColumnsWidth = computed(() => {
	return props.columns.reduce((sum, col) => sum + (col.width || 100), 0);
});

const needsHorizontalScroll = computed(() => {
	return totalColumnsWidth.value > containerWidth.value;
});

const adjustedColumns = computed(() => {
	if (containerWidth.value === 0) return props.columns;

	// If columns fit within container, expand them and remove fixed positioning
	if (!needsHorizontalScroll.value) {
		const scale = containerWidth.value / totalColumnsWidth.value;
		return props.columns.map((col) => ({
			...col,
			width: Math.floor((col.width || 100) * scale),
			fixed: undefined, // Remove fixed positioning when no scroll needed
		}));
	}

	return props.columns;
});

const updateWidth = (width: number) => {
	containerWidth.value = width;
};
</script>

<template>
	<div :class="$style.container">
		<ElAutoResizer @resize="({ width }) => updateWidth(width)">
			<template #default="{ width }">
				<ElTableV2
					v-loading="loading"
					:columns="adjustedColumns"
					:data="data"
					:width="width"
					:height="tableHeight"
					:row-height="rowHeight"
					:header-height="headerHeight"
					:row-key="rowKey"
					:fixed="needsHorizontalScroll"
					:h-scrollbar-size="6"
					:v-scrollbar-size="6"
				/>
			</template>
		</ElAutoResizer>
	</div>
</template>

<style module>
.container {
	width: 100%;
	min-height: v-bind('minHeight + "px"');
}
</style>
