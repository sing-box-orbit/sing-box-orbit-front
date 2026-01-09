import { type Static, Type } from 'typebox';

// Sign In Form Schema
export const SignInSchema = Type.Object({
	emailOrUsername: Type.String({ minLength: 1, error: 'validation.required' }),
	password: Type.String({ minLength: 1, error: 'validation.required' }),
});
export type SignInForm = Static<typeof SignInSchema>;

// Server Form Schema
export const CreateServerSchema = Type.Object({
	name: Type.String({ minLength: 1, error: 'validation.required' }),
	url: Type.String({
		minLength: 1,
		pattern: '^https?://',
		error: 'validation.invalidUrl',
	}),
	apiToken: Type.String({ minLength: 1, error: 'validation.required' }),
	location: Type.Optional(Type.String()),
});
export type CreateServerForm = Static<typeof CreateServerSchema>;

export const UpdateServerSchema = Type.Object({
	name: Type.String({ minLength: 1, error: 'validation.required' }),
	url: Type.String({
		minLength: 1,
		pattern: '^https?://',
		error: 'validation.invalidUrl',
	}),
	apiToken: Type.Optional(Type.String()),
	location: Type.Optional(Type.String()),
});
export type UpdateServerForm = Static<typeof UpdateServerSchema>;

// Client Form Schema
export const CreateClientSchema = Type.Object({
	username: Type.String({
		minLength: 1,
		pattern: '^[a-zA-Z0-9_-]+$',
		error: 'validation.invalidUsername',
	}),
	email: Type.Optional(
		Type.String({
			pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
			error: 'validation.invalidEmail',
		}),
	),
	expiresAt: Type.Optional(Type.String()),
	serverIds: Type.Array(Type.String()),
	subscriptionTemplateId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type CreateClientForm = Static<typeof CreateClientSchema>;

export const UpdateClientSchema = Type.Object({
	username: Type.String({
		minLength: 1,
		pattern: '^[a-zA-Z0-9_-]+$',
		error: 'validation.invalidUsername',
	}),
	email: Type.Optional(
		Type.String({
			pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
			error: 'validation.invalidEmail',
		}),
	),
	expiresAt: Type.Optional(Type.String()),
	subscriptionTemplateId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type UpdateClientForm = Static<typeof UpdateClientSchema>;

// Subscription Template Form Schema
export const CreateSubscriptionTemplateSchema = Type.Object({
	name: Type.String({ minLength: 1, error: 'validation.required' }),
	profileTitle: Type.Optional(Type.String()),
	updateInterval: Type.Number({ minimum: 1, maximum: 168, error: 'validation.invalidInterval' }),
	updateAlways: Type.Boolean(),
	announce: Type.Optional(Type.String()),
	announceUrl: Type.Optional(
		Type.String({
			pattern: '^(https?://|$)',
			error: 'validation.invalidUrl',
		}),
	),
	routing: Type.Optional(Type.String()),
	trafficTotal: Type.String(),
});
export type CreateSubscriptionTemplateForm = Static<typeof CreateSubscriptionTemplateSchema>;

export const UpdateSubscriptionTemplateSchema = CreateSubscriptionTemplateSchema;
export type UpdateSubscriptionTemplateForm = CreateSubscriptionTemplateForm;
