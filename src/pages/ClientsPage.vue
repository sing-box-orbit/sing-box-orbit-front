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
import { useFormValidation } from '@/composables/useFormValidation';
import { graphql } from '@/graphql/graphql';
import { CreateClientSchema, UpdateClientSchema } from '@/schemas';
import IconCopy from '~icons/tabler/copy';
import IconEdit from '~icons/tabler/edit';
import IconLink from '~icons/tabler/link';
import IconPlus from '~icons/tabler/plus';
import IconRefresh from '~icons/tabler/refresh';
import IconTrash from '~icons/tabler/trash';

const { t } = useI18n();

const ClientsQuery = graphql(`
	query Clients {
		clients(first: 1000) {
			edges {
				node {
					id
					username
					email
					enabled
					expiresAt
					createdAt
					servers {
						id
						server {
							id
							name
							status
						}
					}
					subscription {
						id
						token
						url
					}
					subscriptionTemplate {
						id
						name
					}
				}
			}
			totalCount
		}
	}
`);

const ServersQuery = graphql(`
	query ServersForClients {
		servers(first: 1000) {
			edges {
				node {
					id
					name
					status
				}
			}
		}
	}
`);

const SubscriptionTemplatesQuery = graphql(`
	query SubscriptionTemplatesForClients {
		subscriptionTemplates(first: 1000) {
			edges {
				node {
					id
					name
				}
			}
		}
	}
`);

const CreateClientMutation = graphql(`
	mutation CreateClient($input: CreateClientInput!) {
		createClient(input: $input) {
			id
			username
			subscriptionTemplate {
				id
				name
			}
		}
	}
`);

const UpdateClientMutation = graphql(`
	mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
		updateClient(id: $id, input: $input) {
			id
			username
			subscriptionTemplate {
				id
				name
			}
		}
	}
`);

const DeleteClientMutation = graphql(`
	mutation DeleteClient($id: ID!) {
		deleteClient(id: $id)
	}
`);

const AddClientToServerMutation = graphql(`
	mutation AddClientToServer($clientId: ID!, $serverId: ID!) {
		addClientToServer(clientId: $clientId, serverId: $serverId) {
			id
		}
	}
`);

const RemoveClientFromServerMutation = graphql(`
	mutation RemoveClientFromServer($clientId: ID!, $serverId: ID!) {
		removeClientFromServer(clientId: $clientId, serverId: $serverId) {
			id
		}
	}
`);

const RegenerateTokenMutation = graphql(`
	mutation RegenerateSubscriptionToken($clientId: ID!) {
		regenerateSubscriptionToken(clientId: $clientId) {
			id
			subscription {
				token
			}
		}
	}
`);

const { data, fetching, executeQuery } = useQuery({ query: ClientsQuery });
const { data: serversData } = useQuery({ query: ServersQuery });
const { data: templatesData } = useQuery({ query: SubscriptionTemplatesQuery });
const createClientMutation = useMutation(CreateClientMutation);
const updateClientMutation = useMutation(UpdateClientMutation);
const deleteClientMutation = useMutation(DeleteClientMutation);
const addClientToServerMutation = useMutation(AddClientToServerMutation);
const removeClientFromServerMutation = useMutation(RemoveClientFromServerMutation);
const regenerateTokenMutation = useMutation(RegenerateTokenMutation);

type Client = NonNullable<typeof data.value>['clients']['edges'][0]['node'];

const clients = computed(() => data.value?.clients?.edges.map((e) => e.node) ?? []);
const totalCount = computed(() => data.value?.clients?.totalCount ?? 0);
const servers = computed(() => serversData.value?.servers?.edges.map((e) => e.node) ?? []);
const subscriptionTemplates = computed(
	() => templatesData.value?.subscriptionTemplates?.edges.map((e) => e.node) ?? [],
);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingClientId = ref<string | null>(null);
const formLoading = ref(false);

const serverDialogVisible = ref(false);
const selectedClient = ref<Client | null>(null);

const form = ref({
	username: '',
	email: '',
	expiresAt: '',
	serverIds: [] as string[],
	subscriptionTemplateId: null as string | null,
});

const currentSchema = computed(() => (dialogMode.value === 'create' ? CreateClientSchema : UpdateClientSchema));
const { errors, validate, clearErrors } = useFormValidation(currentSchema, form);

const resetForm = () => {
	form.value = { username: '', email: '', expiresAt: '', serverIds: [], subscriptionTemplateId: null };
	editingClientId.value = null;
	clearErrors();
};

const openCreateDialog = () => {
	dialogMode.value = 'create';
	resetForm();
	dialogVisible.value = true;
};

const openEditDialog = (client: Client) => {
	dialogMode.value = 'edit';
	editingClientId.value = client.id;
	form.value = {
		username: client.username,
		email: client.email ?? '',
		expiresAt: client.expiresAt ?? '',
		serverIds: client.servers.map((s) => s.server.id),
		subscriptionTemplateId: client.subscriptionTemplate?.id ?? null,
	};
	dialogVisible.value = true;
};

const openServerDialog = (client: Client) => {
	selectedClient.value = client;
	serverDialogVisible.value = true;
};

const handleSubmit = async () => {
	if (!validate()) return;

	formLoading.value = true;
	try {
		if (dialogMode.value === 'create') {
			const result = await createClientMutation.executeMutation({
				input: {
					username: form.value.username,
					email: form.value.email || null,
					expiresAt: form.value.expiresAt || null,
					serverIds: form.value.serverIds,
					subscriptionTemplateId: form.value.subscriptionTemplateId,
				},
			});
			if (result.error) {
				ElMessage.error(result.error.message);
				return;
			}
			ElMessage.success(t('clients.createSuccess'));
			dialogVisible.value = false;
			executeQuery({ requestPolicy: 'network-only' });
			return;
		}

		if (!editingClientId.value) return;

		const result = await updateClientMutation.executeMutation({
			id: editingClientId.value,
			input: {
				username: form.value.username || null,
				email: form.value.email || null,
				expiresAt: form.value.expiresAt || null,
				subscriptionTemplateId: form.value.subscriptionTemplateId,
			},
		});
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('clients.updateSuccess'));
		dialogVisible.value = false;
		executeQuery({ requestPolicy: 'network-only' });
	} finally {
		formLoading.value = false;
	}
};

const handleDelete = async (client: Client) => {
	try {
		await ElMessageBox.confirm(t('clients.deleteConfirm', { name: client.username }), t('common.warning'), {
			confirmButtonText: t('common.confirm'),
			cancelButtonText: t('common.cancel'),
			type: 'warning',
		});
		const result = await deleteClientMutation.executeMutation({ id: client.id });
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('clients.deleteSuccess'));
		executeQuery({ requestPolicy: 'network-only' });
	} catch {
		// cancelled
	}
};

const handleToggleServer = async (serverId: string) => {
	if (!selectedClient.value) return;

	const isAssigned = selectedClient.value.servers.some((s) => s.server.id === serverId);

	if (isAssigned) {
		const result = await removeClientFromServerMutation.executeMutation({
			clientId: selectedClient.value.id,
			serverId,
		});
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('clients.serverRemoved'));
	} else {
		const result = await addClientToServerMutation.executeMutation({
			clientId: selectedClient.value.id,
			serverId,
		});
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('clients.serverAdded'));
	}
	executeQuery({ requestPolicy: 'network-only' });
};

const handleRegenerateToken = async (client: Client) => {
	try {
		await ElMessageBox.confirm(t('clients.regenerateConfirm'), t('common.warning'), {
			confirmButtonText: t('common.confirm'),
			cancelButtonText: t('common.cancel'),
			type: 'warning',
		});
		const result = await regenerateTokenMutation.executeMutation({ clientId: client.id });
		if (result.error) {
			ElMessage.error(result.error.message);
			return;
		}
		ElMessage.success(t('clients.tokenRegenerated'));
		executeQuery({ requestPolicy: 'network-only' });
	} catch {
		// cancelled
	}
};

const copySubscriptionUrl = (client: Client) => {
	if (!client.subscription) return;
	navigator.clipboard.writeText(client.subscription.url);
	ElMessage.success(t('clients.urlCopied'));
};

const formatDate = (dateString: string | null) => {
	if (!dateString) return '-';
	return new Date(dateString).toLocaleString();
};

const isServerAssigned = (serverId: string) => {
	if (!selectedClient.value) return false;
	return selectedClient.value.servers.some((s) => s.server.id === serverId);
};

const columns = computed(() => [
	{
		key: 'username',
		dataKey: 'username',
		title: t('clients.username'),
		width: 150,
	},
	{
		key: 'email',
		dataKey: 'email',
		title: t('clients.email'),
		width: 180,
		cellRenderer: ({ rowData }: { rowData: Client }) => h('span', rowData.email || '-'),
	},
	{
		key: 'enabled',
		dataKey: 'enabled',
		title: t('clients.status'),
		width: 100,
		cellRenderer: ({ rowData }: { rowData: Client }) =>
			h(ElTag, { type: rowData.enabled ? 'success' : 'danger', size: 'small' }, () =>
				rowData.enabled ? t('clients.active') : t('clients.disabled'),
			),
	},
	{
		key: 'servers',
		title: t('clients.servers'),
		width: 120,
		cellRenderer: ({ rowData }: { rowData: Client }) =>
			h(
				ElButton,
				{ size: 'small', link: true, type: 'primary', onClick: () => openServerDialog(rowData) },
				() => `${rowData.servers.length} ${t('clients.serversCount')}`,
			),
	},
	{
		key: 'subscriptionTemplate',
		title: t('clients.subscriptionTemplate'),
		width: 150,
		cellRenderer: ({ rowData }: { rowData: Client }) => h('span', rowData.subscriptionTemplate?.name || '-'),
	},
	{
		key: 'expiresAt',
		dataKey: 'expiresAt',
		title: t('clients.expiresAt'),
		width: 180,
		cellRenderer: ({ rowData }: { rowData: Client }) => h('span', formatDate(rowData.expiresAt)),
	},
	{
		key: 'actions',
		title: t('common.actions'),
		width: 220,
		fixed: TableV2FixedDir.RIGHT,
		cellRenderer: ({ rowData }: { rowData: Client }) =>
			h(ElButtonGroup, null, () => [
				h(ElTooltip, { content: t('clients.copyUrl') }, () =>
					h(
						ElButton,
						{
							size: 'small',
							disabled: !rowData.subscription,
							onClick: () => copySubscriptionUrl(rowData),
						},
						() => h(ElIcon, null, () => h(IconCopy)),
					),
				),
				h(ElTooltip, { content: t('clients.regenerateToken') }, () =>
					h(
						ElButton,
						{
							size: 'small',
							onClick: () => handleRegenerateToken(rowData),
						},
						() => h(ElIcon, null, () => h(IconRefresh)),
					),
				),
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
]);
</script>

<template>
	<div :class="$style.page">
		<div :class="$style.header">
			<h1 :class="$style.title">{{ t('nav.clients') }}</h1>
			<div :class="$style.headerRight">
				<span :class="$style.total">{{ t('common.total') }}: {{ totalCount }}</span>
				<el-button type="primary" @click="openCreateDialog">
					<el-icon><IconPlus /></el-icon>
					{{ t('clients.add') }}
				</el-button>
			</div>
		</div>

		<el-card shadow="never" :class="$style.card">
			<VirtualTable :data="clients" :columns="columns" :loading="fetching" row-key="id" />
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="dialogMode === 'create' ? t('clients.add') : t('clients.edit')"
			width="500"
		>
			<el-form :model="form" label-position="top">
				<el-form-item :label="t('clients.username')" required :error="errors.username ? t(errors.username) : ''">
					<el-input v-model="form.username" :placeholder="t('clients.usernamePlaceholder')" />
				</el-form-item>
				<el-form-item :label="t('clients.email')" :error="errors.email ? t(errors.email) : ''">
					<el-input v-model="form.email" type="email" :placeholder="t('clients.emailPlaceholder')" />
				</el-form-item>
				<el-form-item :label="t('clients.expiresAt')">
					<el-date-picker
						v-model="form.expiresAt"
						type="datetime"
						:placeholder="t('clients.expiresAtPlaceholder')"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item v-if="dialogMode === 'create'" :label="t('clients.servers')">
					<el-select v-model="form.serverIds" multiple :placeholder="t('clients.selectServers')" style="width: 100%">
						<el-option v-for="server in servers" :key="server.id" :label="server.name" :value="server.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="t('clients.subscriptionTemplate')">
					<el-select
						v-model="form.subscriptionTemplateId"
						:placeholder="t('clients.selectTemplate')"
						clearable
						style="width: 100%"
					>
						<el-option
							v-for="template in subscriptionTemplates"
							:key="template.id"
							:label="template.name"
							:value="template.id"
						/>
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
				<el-button type="primary" :loading="formLoading" @click="handleSubmit">
					{{ dialogMode === 'create' ? t('common.create') : t('common.save') }}
				</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="serverDialogVisible" :title="t('clients.manageServers')" width="500">
			<div v-if="selectedClient" :class="$style.serverList">
				<div v-for="server in servers" :key="server.id" :class="$style.serverItem">
					<div :class="$style.serverInfo">
						<el-icon><IconLink /></el-icon>
						<span>{{ server.name }}</span>
						<el-tag :type="server.status === 'ONLINE' ? 'success' : 'danger'" size="small">
							{{ server.status }}
						</el-tag>
					</div>
					<el-switch :model-value="isServerAssigned(server.id)" @change="handleToggleServer(server.id)" />
				</div>
			</div>
			<template #footer>
				<el-button @click="serverDialogVisible = false">{{ t('common.close') }}</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<style module>
.page {
	max-width: 1400px;
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

.serverList {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.serverItem {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	border: 1px solid var(--el-border-color);
	border-radius: 8px;
}

.serverInfo {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
