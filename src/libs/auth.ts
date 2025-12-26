import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

const TOKEN_KEY = 'auth_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY) ?? undefined
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	plugins: [usernameClient()],
	fetchOptions: {
		credentials: 'include',
		onSuccess: (ctx) => {
			const jwtToken = ctx.response.headers.get('set-auth-jwt')
			if (jwtToken) {
				setToken(jwtToken)
			}
		},
	},
})

export const { signIn, signUp, useSession } = authClient

export const signOut = async () => {
	await authClient.signOut()
	removeToken()
}
