import { createRouter, createWebHistory } from 'vue-router'
import ClientsPage from '@/pages/ClientsPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import ServersPage from '@/pages/ServersPage.vue'
import SubscriptionTemplatesPage from '@/pages/SubscriptionTemplatesPage.vue'

const routes = [
	{
		path: '/',
		name: 'dashboard',
		component: DashboardPage,
	},
	{
		path: '/servers',
		name: 'servers',
		component: ServersPage,
	},
	{
		path: '/clients',
		name: 'clients',
		component: ClientsPage,
	},
	{
		path: '/subscription-templates',
		name: 'subscription-templates',
		component: SubscriptionTemplatesPage,
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
