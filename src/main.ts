import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/theme-chalk/display.css';
import '@/styles/index.css';
import urql from '@urql/vue';
import { createApp } from 'vue';
import App from '@/App.vue';
import { client } from '@/graphql/client';
import { i18n } from '@/i18n';
import { router } from '@/router';

createApp(App).use(ElementPlus).use(urql, client).use(i18n).use(router).mount('#app');
