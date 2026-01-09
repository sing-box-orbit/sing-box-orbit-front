<script setup lang="ts" generic="T">
import type { Column } from 'element-plus';
import { ElAutoResizer, ElTableV2 } from 'element-plus';
import { computed } from 'vue';

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
</script>

<template>
	<div :class="$style.container">
		<ElAutoResizer>
			<template #default="{ width }">
				<ElTableV2
					v-loading="loading"
					:columns="columns"
					:data="data"
					:width="width"
					:height="tableHeight"
					:row-height="rowHeight"
					:header-height="headerHeight"
					:row-key="rowKey"
					fixed
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
