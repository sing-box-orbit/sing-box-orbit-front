<script setup lang="ts">
import { useMutation, useQuery } from '@urql/vue';
import {
	ElButton,
	ElButtonGroup,
	ElIcon,
	ElMessage,
	ElMessageBox,
	ElTag,
	ElTooltip,
	TableV2FixedDir,
} from 'element-plus';
import { computed, h, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VirtualTable from '@/components/VirtualTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';
import { useFormValidation } from '@/composables/useFormValidation';
import { graphql } from '@/graphql/graphql';
import { CreateServerSchema, UpdateServerSchema } from '@/schemas';
import IconCloud from '~icons/tabler/cloud';
import IconEdit from '~icons/tabler/edit';
import IconPlus from '~icons/tabler/plus';
import IconRefresh from '~icons/tabler/refresh';
import IconTrash from '~icons/tabler/trash';

const { t } = useI18n();
const { isMobile, dialogWidth } = useBreakpoints();

const ServersQuery = graphql(`
	query Servers {
		servers(first: 1000) {
			edges {
				node {
					id
					name
					url
					status
					location
					lastSyncAt
					createdAt
					inbounds {
						id
						tag
						type
						port
						enabled
					}
				}
			}
			totalCount
		}
	}
`);

const CreateServerMutation = graphql(`
	mutation CreateServer($input: CreateServerInput!) {
		createServer(input: $input) {
			id
			name
		}
	}
`);

const UpdateServerMutation = graphql(`
	mutation UpdateServer($id: ID!, $input: UpdateServerInput!) {
		updateServer(id: $id, input: $input) {
			id
			name
		}
	}
`);

const DeleteServerMutation = graphql(`
	mutation DeleteServer($id: ID!) {
		deleteServer(id: $id)
	}
`);

const SyncServerMutation = graphql(`
	mutation SyncServer($id: ID!) {
		syncServer(id: $id) {
			id
			status
			lastSyncAt
		}
	}
`);

const { data, fetching, executeQuery } = useQuery({ query: ServersQuery });
const createServerMutation = useMutation(CreateServerMutation);
const updateServerMutation = useMutation(UpdateServerMutation);
const deleteServerMutation = useMutation(DeleteServerMutation);
const syncServerMutation = useMutation(SyncServerMutation);

type Server = NonNullable<typeof data.value>['servers']['edges'][0]['node'];

const servers = computed(() => data.value?.servers?.edges.map((e) => e.node) ?? []);
const totalCount = computed(() => data.value?.servers?.totalCount ?? 0);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingServerId = ref<string | null>(null);
const formLoading = ref(false);

const form = ref({
	name: '',
	url: '',
	apiToken: '',
	location: '',
});

const currentSchema = computed(() => (dialogMode.value === 'create' ? CreateServerSchema : UpdateServerSchema));
const { errors, validate, clearErrors } = useFormValidation(currentSchema, form);

const resetForm = () => {
	form.value = { name: '', url: '', apiToken: '', location: '' };
	editingServerId.value = null;
	clearErrors();
};

const openCreateDialog = () => {
	dialogMode.value = 'create';
	resetForm();
	dialogVisible.value = true;
};

const openEditDialog = (server: Server) => {
	dialogMode.value = 'edit';
	editingServerId.value = server.id;
	form.value = {
		name: server.name,
		url: server.url,
		apiToken: '',
		location: server.location ?? '',
	};
	dialogVisible.value = true;
};

const handleSubmit = async () => {
	if (!validate()) return;

	formLoading.value = true;
	try {
		if (dialogMode.value === 'create') {
			const result = await createServerMutation.executeMutation({
				input: {
					name: form.value.name,
					url: form.value.url,
					apiToken: form.value.apiToken,
					location: form.value.location || null,
				},
			});
			if (result.error) {
				ElMessage.error(result.error.message);
				return;
			}
			ElMessage.success(t('servers.createSuccess'));
			dialogVisible.value = false;
			executeQuery({ requestPolicy: 'network-only' });
			return;
		}

		if (!editingServerId.value) return;

		const input: Record<string, string | null> = {};
		if (form.value.name) input.name = form.value.name;
		if (form.value.url) input.url = form.value.url;
		if (form.value.apiToken) input.apiToken = form.value.apiToken;
		input.location = form.value.location || null;

		const result = await updateServerMutation.executeMutation({
			id: editingServerId.value,
			input,
		});
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('servers.updateSuccess'));
		dialogVisible.value = false;
		executeQuery({ requestPolicy: 'network-only' });
	} finally {
		formLoading.value = false;
	}
};

const handleDelete = async (server: Server) => {
	try {
		await ElMessageBox.confirm(t('servers.deleteConfirm', { name: server.name }), t('common.warning'), {
			confirmButtonText: t('common.confirm'),
			cancelButtonText: t('common.cancel'),
			type: 'warning',
		});
		const result = await deleteServerMutation.executeMutation({ id: server.id });
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('servers.deleteSuccess'));
		executeQuery({ requestPolicy: 'network-only' });
	} catch {
		// cancelled
	}
};

const handleSync = async (server: Server) => {
	const result = await syncServerMutation.executeMutation({ id: server.id });
	if (result.error) {
		ElMessage.error(result.error.message);
		return;
	}
	ElMessage.success(t('servers.syncSuccess'));
	executeQuery({ requestPolicy: 'network-only' });
};

const getStatusType = (status: string) => {
	switch (status) {
		case 'ONLINE':
			return 'success';
		case 'OFFLINE':
			return 'danger';
		case 'SYNCING':
			return 'warning';
		case 'ERROR':
			return 'danger';
		default:
			return 'info';
	}
};

const formatDate = (dateString: string | null) => {
	if (!dateString) return '-';
	return new Date(dateString).toLocaleString();
};

const columns = computed(() => {
	const cols: Array<{
		key: string;
		dataKey?: string;
		title: string;
		width: number;
		fixed?: TableV2FixedDir;
		cellRenderer?: ({ rowData }: { rowData: Server }) => ReturnType<typeof h>;
	}> = [
		{
			key: 'name',
			dataKey: 'name',
			title: t('servers.name'),
			width: isMobile.value ? 120 : 150,
		},
		{
			key: 'url',
			dataKey: 'url',
			title: t('servers.url'),
			width: isMobile.value ? 150 : 200,
		},
	];

	// Hide location on mobile
	if (!isMobile.value) {
		cols.push({
			key: 'location',
			dataKey: 'location',
			title: t('servers.location'),
			width: 120,
			cellRenderer: ({ rowData }) => h('span', rowData.location || '-'),
		});
	}

	cols.push({
		key: 'status',
		dataKey: 'status',
		title: t('servers.status'),
		width: isMobile.value ? 80 : 100,
		cellRenderer: ({ rowData }) =>
			h(ElTag, { type: getStatusType(rowData.status), size: 'small' }, () => rowData.status),
	});

	cols.push({
		key: 'inbounds',
		title: t('servers.inbounds'),
		width: isMobile.value ? 70 : 100,
		cellRenderer: ({ rowData }) => h('span', String(rowData.inbounds.length)),
	});

	// Hide lastSyncAt on mobile
	if (!isMobile.value) {
		cols.push({
			key: 'lastSyncAt',
			dataKey: 'lastSyncAt',
			title: t('servers.lastSync'),
			width: 180,
			cellRenderer: ({ rowData }) => h('span', formatDate(rowData.lastSyncAt)),
		});
	}

	cols.push({
		key: 'actions',
		title: t('common.actions'),
		width: isMobile.value ? 120 : 180,
		fixed: TableV2FixedDir.RIGHT,
		cellRenderer: ({ rowData }) =>
			h(ElButtonGroup, null, () => [
				h(ElTooltip, { content: t('servers.sync'), disabled: isMobile.value }, () =>
					h(
						ElButton,
						{
							size: 'small',
							loading: syncServerMutation.fetching.value,
							onClick: () => handleSync(rowData),
						},
						() => h(ElIcon, null, () => h(IconRefresh)),
					),
				),
				h(ElTooltip, { content: t('common.edit'), disabled: isMobile.value }, () =>
					h(
						ElButton,
						{
							size: 'small',
							onClick: () => openEditDialog(rowData),
						},
						() => h(ElIcon, null, () => h(IconEdit)),
					),
				),
				h(ElTooltip, { content: t('common.delete'), disabled: isMobile.value }, () =>
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
	});

	return cols;
});
</script>

<template>
	<div :class="$style.page">
		<div :class="$style.header">
			<h1 :class="$style.title">{{ t('nav.servers') }}</h1>
			<div :class="$style.headerRight">
				<span :class="$style.total">{{ t('common.total') }}: {{ totalCount }}</span>
				<el-button type="primary" @click="openCreateDialog">
					<el-icon><IconPlus /></el-icon>
					{{ t('servers.add') }}
				</el-button>
			</div>
		</div>

		<el-card shadow="never" :class="$style.card">
			<VirtualTable :data="servers" :columns="columns" :loading="fetching" row-key="id" />
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="dialogMode === 'create' ? t('servers.add') : t('servers.edit')"
			:width="dialogWidth"
		>
			<el-form :model="form" label-position="top">
				<el-form-item :label="t('servers.name')" required :error="errors.name ? t(errors.name) : ''">
					<el-input v-model="form.name" :placeholder="t('servers.namePlaceholder')" />
				</el-form-item>
				<el-form-item :label="t('servers.url')" required :error="errors.url ? t(errors.url) : ''">
					<el-input v-model="form.url" :placeholder="t('servers.urlPlaceholder')" />
				</el-form-item>
				<el-form-item
					:label="t('servers.apiToken')"
					:required="dialogMode === 'create'"
					:error="errors.apiToken ? t(errors.apiToken) : ''"
				>
					<el-input
						v-model="form.apiToken"
						type="password"
						show-password
						:placeholder="
							dialogMode === 'create' ? t('servers.apiTokenPlaceholder') : t('servers.apiTokenEditPlaceholder')
						"
					/>
				</el-form-item>
				<el-form-item :label="t('servers.location')">
					<el-input v-model="form.location" :placeholder="t('servers.locationPlaceholder')">
						<template #prefix>
							<el-icon><IconCloud /></el-icon>
						</template>
					</el-input>
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
	width: 100%;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
	gap: 12px;
	flex-wrap: wrap;
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

@media (max-width: 767px) {
	.header {
		margin-bottom: 16px;
	}

	.headerRight {
		gap: 8px;
	}

	.total {
		display: none;
	}

	.title {
		font-size: 20px;
	}
}
</style>
