<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SignInForm from '@/components/SignInForm.vue'
import { elementPlusLocales } from '@/i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import FullscreenLayout from '@/layouts/FullscreenLayout.vue'
import { authClient } from '@/libs/auth'

const session = authClient.useSession()
const { locale } = useI18n()

const elementPlusLocale = computed(() => {
	return elementPlusLocales[locale.value as keyof typeof elementPlusLocales] ?? elementPlusLocales.en
})
</script>

<template>
	<el-config-provider :locale="elementPlusLocale">
		<el-skeleton v-if="session.isPending" :rows="5" animated />

		<DefaultLayout v-else-if="session.data">
			<router-view />
		</DefaultLayout>

		<FullscreenLayout v-else>
			<SignInForm />
		</FullscreenLayout>
	</el-config-provider>
</template>
