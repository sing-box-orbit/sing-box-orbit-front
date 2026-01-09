import { cacheExchange, createClient, fetchExchange } from '@urql/vue';
import { getToken } from '@/libs/auth';

export const client = createClient({
	url: `${import.meta.env.VITE_API_URL}/graphql`,
	exchanges: [cacheExchange, fetchExchange],
	fetchOptions: () => {
		const token = getToken();
		const headers: Record<string, string> = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		return { headers };
	},
});
