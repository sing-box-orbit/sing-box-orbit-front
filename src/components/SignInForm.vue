<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormValidation } from '@/composables/useFormValidation';
import { signIn } from '@/libs/auth';
import { SignInSchema } from '@/schemas';
import IconLanguage from '~icons/tabler/language';

const { t, locale } = useI18n();

const languages = [
	{ code: 'en', name: 'English' },
	{ code: 'ru', name: 'Русский' },
];

const setLanguage = (code: string) => {
	locale.value = code;
	localStorage.setItem('locale', code);
};

const loading = ref(false);

const form = ref({
	emailOrUsername: '',
	password: '',
});

const { errors, validate } = useFormValidation(SignInSchema, form);

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const handleSubmit = async () => {
	if (!validate()) return;

	loading.value = true;

	try {
		const input = form.value.emailOrUsername.trim();

		if (isEmail(input)) {
			const { error } = await signIn.email({
				email: input,
				password: form.value.password,
			});

			if (error) {
				ElMessage.error(error.message || t('auth.signInError'));
				return;
			}
		} else {
			const { error } = await signIn.username({
				username: input,
				password: form.value.password,
			});

			if (error) {
				ElMessage.error(error.message || t('auth.signInError'));
				return;
			}
		}

		ElMessage.success(t('auth.signInSuccess'));
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<el-card :class="$style.card">
		<template #header>
			<div :class="$style.header">
				<h2 :class="$style.title">{{ t('auth.signIn') }}</h2>
				<el-dropdown trigger="click" @command="setLanguage">
					<el-button :class="$style.langButton" text>
						<IconLanguage :class="$style.langIcon" />
					</el-button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item
								v-for="lang in languages"
								:key="lang.code"
								:command="lang.code"
								:class="lang.code === locale ? $style.activeLang : ''"
							>
								{{ lang.name }}
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</template>

		<el-form @submit.prevent="handleSubmit" label-position="top">
			<el-form-item
				:label="t('auth.emailOrUsername')"
				:error="errors.emailOrUsername ? t(errors.emailOrUsername) : ''"
			>
				<el-input v-model="form.emailOrUsername" :placeholder="t('auth.emailOrUsernamePlaceholder')" />
			</el-form-item>

			<el-form-item :label="t('auth.password')" :error="errors.password ? t(errors.password) : ''">
				<el-input
					v-model="form.password"
					type="password"
					:placeholder="t('auth.passwordPlaceholder')"
					show-password
				/>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" native-type="submit" :loading="loading" :class="$style.submitBtn">
					{{ t('auth.signIn') }}
				</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<style module>
.card {
	width: 400px;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.title {
	margin: 0;
	flex: 1;
	text-align: center;
}

.langButton {
	width: 32px;
	height: 32px;
	border-radius: 6px;
	padding: 0;
	margin-left: auto;
}

.langIcon {
	width: 18px;
	height: 18px;
	color: var(--el-text-color-regular);
}

.langButton:hover .langIcon {
	color: var(--el-color-primary);
}

.activeLang {
	background: var(--el-color-primary-light-9);
	color: var(--el-color-primary);
}

.submitBtn {
	width: 100%;
}
</style>
