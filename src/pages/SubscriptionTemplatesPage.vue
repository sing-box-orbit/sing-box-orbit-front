<script setup lang="ts">
import { useMutation, useQuery } from '@urql/vue'
import { ElButton, ElButtonGroup, ElIcon, ElMessage, ElMessageBox, ElTooltip, TableV2FixedDir } from 'element-plus'
import { computed, h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VirtualTable from '@/components/VirtualTable.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { graphql } from '@/graphql/graphql'
import { CreateSubscriptionTemplateSchema } from '@/schemas'
import IconEdit from '~icons/tabler/edit'
import IconPlus from '~icons/tabler/plus'
import IconTrash from '~icons/tabler/trash'

const { t } = useI18n()

const SubscriptionTemplatesQuery = graphql(`
	query SubscriptionTemplates {
		subscriptionTemplates(first: 1000) {
			edges {
				node {
					id
					name
					profileTitle
					updateInterval
					updateAlways
					announce
					announceUrl
					routing
					trafficTotal
					clients {
						id
					}
				}
			}
			totalCount
		}
	}
`)

const CreateSubscriptionTemplateMutation = graphql(`
	mutation CreateSubscriptionTemplate($input: CreateSubscriptionTemplateInput!) {
		createSubscriptionTemplate(input: $input) {
			id
			name
		}
	}
`)

const UpdateSubscriptionTemplateMutation = graphql(`
	mutation UpdateSubscriptionTemplate($id: ID!, $input: UpdateSubscriptionTemplateInput!) {
		updateSubscriptionTemplate(id: $id, input: $input) {
			id
			name
		}
	}
`)

const DeleteSubscriptionTemplateMutation = graphql(`
	mutation DeleteSubscriptionTemplate($id: ID!) {
		deleteSubscriptionTemplate(id: $id)
	}
`)

const { data, fetching, executeQuery } = useQuery({ query: SubscriptionTemplatesQuery })
const createMutation = useMutation(CreateSubscriptionTemplateMutation)
const updateMutation = useMutation(UpdateSubscriptionTemplateMutation)
const deleteMutation = useMutation(DeleteSubscriptionTemplateMutation)

type Template = NonNullable<typeof data.value>['subscriptionTemplates']['edges'][0]['node']

const templates = computed(() => data.value?.subscriptionTemplates?.edges.map((e) => e.node) ?? [])
const totalCount = computed(() => data.value?.subscriptionTemplates?.totalCount ?? 0)

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingTemplateId = ref<string | null>(null)
const formLoading = ref(false)

const form = ref({
	name: '',
	profileTitle: '',
	updateInterval: 24,
	updateAlways: false,
	announce: '',
	announceUrl: '',
	routing: '',
	trafficTotal: '0',
})

const { errors, validate, clearErrors } = useFormValidation(CreateSubscriptionTemplateSchema, form)

const resetForm = () => {
	form.value = {
		name: '',
		profileTitle: '',
		updateInterval: 24,
		updateAlways: false,
		announce: '',
		announceUrl: '',
		routing: '',
		trafficTotal: '0',
	}
	editingTemplateId.value = null
	clearErrors()
}

const openCreateDialog = () => {
	dialogMode.value = 'create'
	resetForm()
	dialogVisible.value = true
}

const openEditDialog = (template: Template) => {
	dialogMode.value = 'edit'
	editingTemplateId.value = template.id
	form.value = {
		name: template.name,
		profileTitle: template.profileTitle ?? '',
		updateInterval: template.updateInterval,
		updateAlways: template.updateAlways,
		announce: template.announce ?? '',
		announceUrl: template.announceUrl ?? '',
		routing: template.routing ?? '',
		trafficTotal: template.trafficTotal,
	}
	dialogVisible.value = true
}

const handleSubmit = async () => {
	if (!validate()) return

	formLoading.value = true
	try {
		if (dialogMode.value === 'create') {
			const result = await createMutation.executeMutation({
				input: {
					name: form.value.name,
					profileTitle: form.value.profileTitle || null,
					updateInterval: form.value.updateInterval,
					updateAlways: form.value.updateAlways,
					announce: form.value.announce || null,
					announceUrl: form.value.announceUrl || null,
					routing: form.value.routing || null,
					trafficTotal: form.value.trafficTotal,
				},
			})
			if (result.error) {
				ElMessage.error(result.error.message)
				return
			}
			ElMessage.success(t('subscriptionTemplates.createSuccess'))
			dialogVisible.value = false
			executeQuery({ requestPolicy: 'network-only' })
			return
		}

		if (!editingTemplateId.value) return

		const result = await updateMutation.executeMutation({
			id: editingTemplateId.value,
			input: {
				name: form.value.name,
				profileTitle: form.value.profileTitle || null,
				updateInterval: form.value.updateInterval,
				updateAlways: form.value.updateAlways,
				announce: form.value.announce || null,
				announceUrl: form.value.announceUrl || null,
				routing: form.value.routing || null,
				trafficTotal: form.value.trafficTotal,
			},
		})
		if (result.error) {
			ElMessage.error(result.error.message)
			return
		}
		ElMessage.success(t('subscriptionTemplates.updateSuccess'))
		dialogVisible.value = false
		executeQuery({ requestPolicy: 'network-only' })
	} finally {
		formLoading.value = false
	}
}

const handleDelete = async (template: Template) => {
	try {
		await ElMessageBox.confirm(t('subscriptionTemplates.deleteConfirm', { name: template.name }), t('common.warning'), {
			confirmButtonText: t('common.confirm'),
			cancelButtonText: t('common.cancel'),
			type: 'warning',
		})
		const result = await deleteMutation.executeMutation({ id: template.id })
		if (result.error) {
			ElMessage.error(result.error.message)
			return
		}
		ElMessage.success(t('subscriptionTemplates.deleteSuccess'))
		executeQuery({ requestPolicy: 'network-only' })
	} catch {
		// cancelled
	}
}

const trafficInGB = ref(0)
watch(
	() => form.value.trafficTotal,
	(val) => {
		trafficInGB.value = Number(val) / (1024 * 1024 * 1024)
	},
	{ immediate: true },
)

const updateTrafficFromGB = (gb: number) => {
	form.value.trafficTotal = String(Math.floor(gb * 1024 * 1024 * 1024))
}

const formatTraffic = (bytes: string) => {
	const num = Number(bytes)
	if (num === 0) return '∞'
	const gb = num / (1024 * 1024 * 1024)
	return `${gb.toFixed(1)} GB`
}

const columns = computed(() => [
	{
		key: 'name',
		dataKey: 'name',
		title: t('subscriptionTemplates.name'),
		width: 150,
	},
	{
		key: 'profileTitle',
		dataKey: 'profileTitle',
		title: t('subscriptionTemplates.profileTitle'),
		width: 150,
		cellRenderer: ({ rowData }: { rowData: Template }) => h('span', rowData.profileTitle || '-'),
	},
	{
		key: 'updateInterval',
		dataKey: 'updateInterval',
		title: t('subscriptionTemplates.updateInterval'),
		width: 120,
		cellRenderer: ({ rowData }: { rowData: Template }) => h('span', `${rowData.updateInterval}h`),
	},
	{
		key: 'trafficTotal',
		dataKey: 'trafficTotal',
		title: t('subscriptionTemplates.trafficTotal'),
		width: 120,
		cellRenderer: ({ rowData }: { rowData: Template }) => h('span', formatTraffic(rowData.trafficTotal)),
	},
	{
		key: 'clients',
		title: t('nav.clients'),
		width: 100,
		cellRenderer: ({ rowData }: { rowData: Template }) =>
			h('span', `${rowData.clients.length} ${t('subscriptionTemplates.clientsCount')}`),
	},
	{
		key: 'actions',
		title: t('common.actions'),
		width: 120,
		fixed: TableV2FixedDir.RIGHT,
		cellRenderer: ({ rowData }: { rowData: Template }) =>
			h(ElButtonGroup, null, () => [
				h(ElTooltip, { content: t('common.edit') }, () =>
					h(
						ElButton,
						{
							size: 'small',
							onClick: () => openEditDialog(rowData),
						},
						() => h(ElIcon, null, () => h(IconEdit)),
					),
				),
				h(ElTooltip, { content: t('common.delete') }, () =>
					h(
						ElButton,
						{
							size: 'small',
							type: 'danger',
							onClick: () => handleDelete(rowData),
						},
						() => h(ElIcon, null, () => h(IconTrash)),
					),
				),
			]),
	},
])
</script>

<template>
	<div :class="$style.page">
		<div :class="$style.header">
			<h1 :class="$style.title">{{ t('subscriptionTemplates.title') }}</h1>
			<div :class="$style.headerRight">
				<span :class="$style.total">{{ t('common.total') }}: {{ totalCount }}</span>
				<el-button type="primary" @click="openCreateDialog">
					<el-icon><IconPlus /></el-icon>
					{{ t('subscriptionTemplates.add') }}
				</el-button>
			</div>
		</div>

		<el-card shadow="never" :class="$style.card">
			<VirtualTable :data="templates" :columns="columns" :loading="fetching" row-key="id" />
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="dialogMode === 'create' ? t('subscriptionTemplates.add') : t('subscriptionTemplates.edit')"
			width="600"
		>
			<el-form :model="form" label-position="top">
				<el-form-item
					:label="t('subscriptionTemplates.name')"
					required
					:error="errors.name ? t(errors.name) : ''"
				>
					<el-input v-model="form.name" :placeholder="t('subscriptionTemplates.namePlaceholder')" />
				</el-form-item>

				<el-divider content-position="left">{{ t('subscriptionTemplates.basicSection') }}</el-divider>

				<el-form-item :label="t('subscriptionTemplates.profileTitle')">
					<el-input v-model="form.profileTitle" :placeholder="t('subscriptionTemplates.profileTitlePlaceholder')" />
					<div :class="$style.hint">{{ t('subscriptionTemplates.profileTitleHint') }}</div>
				</el-form-item>

				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item
							:label="t('subscriptionTemplates.updateInterval')"
							:error="errors.updateInterval ? t(errors.updateInterval) : ''"
						>
							<el-input-number v-model="form.updateInterval" :min="1" :max="168" style="width: 100%" />
							<div :class="$style.hint">{{ t('subscriptionTemplates.updateIntervalHint') }}</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :label="t('subscriptionTemplates.updateAlways')">
							<el-switch v-model="form.updateAlways" />
							<div :class="$style.hint">{{ t('subscriptionTemplates.updateAlwaysHint') }}</div>
						</el-form-item>
					</el-col>
				</el-row>

				<el-divider content-position="left">{{ t('subscriptionTemplates.trafficSection') }}</el-divider>

				<el-form-item :label="t('subscriptionTemplates.trafficTotal')">
					<el-input-number
						:model-value="trafficInGB"
						:min="0"
						:precision="2"
						:step="10"
						style="width: 200px"
						@update:model-value="updateTrafficFromGB"
					/>
					<span :class="$style.unit">GB</span>
					<div :class="$style.hint">{{ t('subscriptionTemplates.trafficTotalHint') }}</div>
				</el-form-item>

				<el-divider content-position="left">{{ t('subscriptionTemplates.announceSection') }}</el-divider>

				<el-form-item :label="t('subscriptionTemplates.announce')">
					<el-input
						v-model="form.announce"
						type="textarea"
						:rows="3"
						:placeholder="t('subscriptionTemplates.announcePlaceholder')"
					/>
					<div :class="$style.hint">{{ t('subscriptionTemplates.announceHint') }}</div>
				</el-form-item>

				<el-form-item
					:label="t('subscriptionTemplates.announceUrl')"
					:error="errors.announceUrl ? t(errors.announceUrl) : ''"
				>
					<el-input v-model="form.announceUrl" :placeholder="t('subscriptionTemplates.announceUrlPlaceholder')" />
					<div :class="$style.hint">{{ t('subscriptionTemplates.announceUrlHint') }}</div>
				</el-form-item>

				<el-divider content-position="left">{{ t('subscriptionTemplates.routingSection') }}</el-divider>

				<el-form-item :label="t('subscriptionTemplates.routing')">
					<el-input
						v-model="form.routing"
						type="textarea"
						:rows="4"
						:placeholder="t('subscriptionTemplates.routingPlaceholder')"
					/>
					<div :class="$style.hint">{{ t('subscriptionTemplates.routingHint') }}</div>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
				<el-button type="primary" :loading="formLoading" @click="handleSubmit">
					{{ dialogMode === 'create' ? t('common.create') : t('common.save') }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<style module>
.page {
	max-width: 1200px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
}

.headerRight {
	display: flex;
	align-items: center;
	gap: 16px;
}

.total {
	font-size: 14px;
	color: var(--el-text-color-secondary);
}

.title {
	margin: 0;
	font-size: 24px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.card {
	border-radius: 8px;
}

.hint {
	font-size: 12px;
	color: var(--el-text-color-secondary);
	margin-top: 4px;
}

.unit {
	margin-left: 8px;
	color: var(--el-text-color-secondary);
}
</style>
