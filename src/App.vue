<script setup lang="ts">
import SignInForm from '@/components/SignInForm.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import FullscreenLayout from '@/layouts/FullscreenLayout.vue'
import { authClient } from '@/libs/auth'

const session = authClient.useSession()
</script>

<template>
	<el-skeleton v-if="session.isPending" :rows="5" animated />

	<DefaultLayout v-else-if="session.data">
		<router-view />
	</DefaultLayout>

	<FullscreenLayout v-else>
		<SignInForm />
	</FullscreenLayout>
</template>
