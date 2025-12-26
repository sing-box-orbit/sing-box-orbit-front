<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { authClient, signOut } from '@/libs/auth'
import IconLogout from '~icons/tabler/logout'
import IconSettings from '~icons/tabler/settings'
import IconUser from '~icons/tabler/user'

const { t } = useI18n()
const session = authClient.useSession()

const handleSignOut = async () => {
	await signOut()
}
</script>

<template>
	<el-dropdown trigger="click" placement="bottom-end" :class="$style.dropdown">
		<div :class="$style.trigger">
			<div :class="$style.avatarWrapper">
				<el-avatar :size="38" :class="$style.avatar">
					{{ session.data?.user.name?.charAt(0).toUpperCase() }}
				</el-avatar>
				<span :class="$style.onlineIndicator" />
			</div>
		</div>
		<template #dropdown>
			<el-dropdown-menu :class="$style.menu">
				<div :class="$style.userHeader">
					<div :class="$style.avatarWrapper">
						<el-avatar :size="40" :class="$style.avatarLarge">
							{{ session.data?.user.name?.charAt(0).toUpperCase() }}
						</el-avatar>
						<span :class="$style.onlineIndicator" />
					</div>
					<div :class="$style.userInfo">
						<span :class="$style.userName">{{ session.data?.user.name }}</span>
						<span :class="$style.userRole">{{ (session.data?.user as any)?.role || 'User' }}</span>
					</div>
				</div>

				<el-dropdown-item :class="$style.menuItem">
					<IconUser :class="$style.menuIcon" />
					{{ t('user.profile') }}
				</el-dropdown-item>
				<el-dropdown-item :class="$style.menuItem">
					<IconSettings :class="$style.menuIcon" />
					{{ t('user.settings') }}
				</el-dropdown-item>

				<div :class="$style.logoutWrapper">
					<el-button type="danger" :class="$style.logoutButton" @click="handleSignOut">
						<IconLogout :class="$style.logoutIcon" />
						{{ t('auth.signOut') }}
					</el-button>
				</div>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<style module>
.dropdown {
	cursor: pointer;
}

.trigger {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.avatarWrapper {
	position: relative;
	display: inline-flex;
}

.avatar {
	background: var(--el-color-primary);
	color: #fff;
	font-weight: 500;
	cursor: pointer;
}

.onlineIndicator {
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 10px;
	height: 10px;
	background: var(--el-color-success);
	border: 2px solid var(--el-bg-color);
	border-radius: 50%;
}

.menu {
	min-width: 230px;
	padding: 0;
}

.userHeader {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.avatarLarge {
	background: var(--el-color-primary);
	color: #fff;
	font-weight: 500;
}

.userInfo {
	display: flex;
	flex-direction: column;
	line-height: 1.4;
}

.userName {
	font-size: 15px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.userRole {
	font-size: 13px;
	color: var(--el-text-color-secondary);
	text-transform: capitalize;
}

.menuItem {
	padding: 10px 16px;
}

.menuIcon {
	width: 20px;
	height: 20px;
	margin-right: 10px;
	color: var(--el-text-color-regular);
}

.logoutWrapper {
	padding: 12px 16px;
	border-top: 1px solid var(--el-border-color-lighter);
}

.logoutButton {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.logoutIcon {
	width: 18px;
	height: 18px;
}
</style>
