<script setup lang="ts">
import { ElProgress, ElTag } from 'element-plus'
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import VirtualTable from '@/components/VirtualTable.vue'

const { t } = useI18n()

const stats = [
	{ title: 'Orders', value: '124k', change: '+12.6%', isPositive: true },
	{ title: 'Sales', value: '175k', change: '-16.2%', isPositive: false },
	{ title: 'Total Profit', value: '1.28k', change: '-12.2%', isPositive: false },
	{ title: 'Total Sales', value: '24.67k', change: '+24.5%', isPositive: true },
]

interface TableRow {
	id: number
	name: string
	status: string
	progress: number
	date: string
}

const tableData: TableRow[] = Array.from({ length: 20 }, (_, i) => ({
	id: i + 1,
	name: `Project ${i + 1}`,
	status: ['Active', 'Pending', 'Completed'][i % 3] as string,
	progress: Math.floor(Math.random() * 100),
	date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}))

const getStatusType = (status: string) => {
	if (status === 'Active') return 'success'
	if (status === 'Pending') return 'warning'
	return 'info'
}

const columns = computed(() => [
	{
		key: 'id',
		dataKey: 'id',
		title: 'ID',
		width: 80,
	},
	{
		key: 'name',
		dataKey: 'name',
		title: 'Project Name',
		width: 200,
	},
	{
		key: 'status',
		dataKey: 'status',
		title: 'Status',
		width: 120,
		cellRenderer: ({ rowData }: { rowData: TableRow }) =>
			h(ElTag, { type: getStatusType(rowData.status), size: 'small' }, () => rowData.status),
	},
	{
		key: 'progress',
		dataKey: 'progress',
		title: 'Progress',
		width: 200,
		cellRenderer: ({ rowData }: { rowData: TableRow }) =>
			h(ElProgress, { percentage: rowData.progress, strokeWidth: 6 }),
	},
	{
		key: 'date',
		dataKey: 'date',
		title: 'Date',
		width: 120,
	},
])
</script>

<template>
	<div :class="$style.page">
		<h1 :class="$style.title">{{ t('nav.dashboard') }}</h1>

		<div :class="$style.statsGrid">
			<el-card v-for="stat in stats" :key="stat.title" :class="$style.statCard" shadow="never">
				<div :class="$style.statTitle">{{ stat.title }}</div>
				<div :class="$style.statValue">{{ stat.value }}</div>
				<div :class="[$style.statChange, stat.isPositive ? $style.positive : $style.negative]">
					{{ stat.change }}
				</div>
			</el-card>
		</div>

		<el-card :class="$style.chartCard" shadow="never">
			<template #header>
				<div :class="$style.cardHeader">
					<span>Revenue Growth</span>
					<el-tag type="success" size="small">Weekly Report</el-tag>
				</div>
			</template>
			<div :class="$style.chartPlaceholder">
				<div :class="$style.chartBar" style="height: 60%"></div>
				<div :class="$style.chartBar" style="height: 80%"></div>
				<div :class="$style.chartBar" style="height: 45%"></div>
				<div :class="$style.chartBar" style="height: 90%"></div>
				<div :class="$style.chartBar" style="height: 70%"></div>
				<div :class="$style.chartBar" style="height: 55%"></div>
				<div :class="$style.chartBar" style="height: 85%"></div>
			</div>
		</el-card>

		<el-card :class="$style.tableCard" shadow="never">
			<template #header>
				<div :class="$style.cardHeader">
					<span>Active Projects</span>
					<el-button type="primary" size="small">View All</el-button>
				</div>
			</template>
			<VirtualTable :data="tableData" :columns="columns" row-key="id" :max-height="500" />
		</el-card>

		<el-card :class="$style.activityCard" shadow="never">
			<template #header>
				<span>Activity Timeline</span>
			</template>
			<el-timeline>
				<el-timeline-item timestamp="2024-01-15" placement="top" type="primary">
					<el-card shadow="never">
						<h4>12 Invoices have been paid</h4>
						<p>Invoices have been paid to the company</p>
					</el-card>
				</el-timeline-item>
				<el-timeline-item timestamp="2024-01-14" placement="top" type="success">
					<el-card shadow="never">
						<h4>Client Meeting</h4>
						<p>Project meeting with john @10:15am</p>
					</el-card>
				</el-timeline-item>
				<el-timeline-item timestamp="2024-01-13" placement="top" type="warning">
					<el-card shadow="never">
						<h4>Create a new project</h4>
						<p>6 team members in a project</p>
					</el-card>
				</el-timeline-item>
				<el-timeline-item timestamp="2024-01-12" placement="top" type="danger">
					<el-card shadow="never">
						<h4>Update server logs</h4>
						<p>Server maintenance completed</p>
					</el-card>
				</el-timeline-item>
			</el-timeline>
		</el-card>
	</div>
</template>

<style module>
.page {
	max-width: 1400px;
}

.title {
	margin: 0 0 24px 0;
	font-size: 24px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.statsGrid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
	margin-bottom: 24px;
}

.statCard {
	border-radius: 8px;
}

.statTitle {
	font-size: 14px;
	color: var(--el-text-color-secondary);
	margin-bottom: 8px;
}

.statValue {
	font-size: 28px;
	font-weight: 600;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
}

.statChange {
	font-size: 13px;
	font-weight: 500;
}

.positive {
	color: var(--el-color-success);
}

.negative {
	color: var(--el-color-danger);
}

.chartCard {
	margin-bottom: 24px;
	border-radius: 8px;
}

.cardHeader {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.chartPlaceholder {
	height: 200px;
	display: flex;
	align-items: flex-end;
	justify-content: space-around;
	padding: 20px;
	background: var(--el-fill-color-lighter);
	border-radius: 8px;
}

.chartBar {
	width: 40px;
	background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-5) 100%);
	border-radius: 4px 4px 0 0;
	transition: height 0.3s;
}

.tableCard {
	margin-bottom: 24px;
	border-radius: 8px;
}

.activityCard {
	border-radius: 8px;
}

.activityCard h4 {
	margin: 0 0 8px 0;
}

.activityCard p {
	margin: 0;
	color: var(--el-text-color-secondary);
}
</style>
