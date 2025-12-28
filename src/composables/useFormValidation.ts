import type { TObject, TProperties, TSchema } from 'typebox'
import type { TLocalizedValidationError } from 'typebox/error'
import { Value } from 'typebox/value'
import { computed, type MaybeRefOrGetter, type Ref, ref, toValue } from 'vue'

export interface UseFormValidationReturn<T> {
	errors: Ref<Record<string, string>>
	validate: () => boolean
	validateField: (field: keyof T) => boolean
	clearErrors: () => void
	clearFieldError: (field: keyof T) => void
	hasErrors: Ref<boolean>
	getFieldError: (field: keyof T) => string | undefined
}

const OPTIONAL_SYMBOL = Symbol.for('typebox.Optional')

function isOptionalField(schema: TSchema): boolean {
	const schemaRecord = schema as Record<string | symbol, unknown>
	return schemaRecord.type === 'union' || Boolean(schemaRecord[OPTIONAL_SYMBOL])
}

export function useFormValidation<T extends Record<string, unknown>>(
	schema: MaybeRefOrGetter<TObject<TProperties>>,
	formData: Ref<T>,
): UseFormValidationReturn<T> {
	const errors = ref<Record<string, string>>({})

	const hasErrors = computed(() => Object.keys(errors.value).length > 0)

	const getSchema = () => toValue(schema)

	const getFieldError = (field: keyof T): string | undefined => {
		return errors.value[field as string]
	}

	const clearErrors = () => {
		errors.value = {}
	}

	const clearFieldError = (field: keyof T) => {
		delete errors.value[field as string]
	}

	const validateField = (field: keyof T): boolean => {
		const currentSchema = getSchema()
		const fieldSchema = currentSchema.properties[field as string]
		if (!fieldSchema) return true

		const fieldValue = formData.value[field]

		if (isOptionalField(fieldSchema) && (fieldValue === '' || fieldValue === undefined || fieldValue === null)) {
			clearFieldError(field)
			return true
		}

		const fieldErrors = [...Value.Errors(fieldSchema, fieldValue)]

		if (fieldErrors.length > 0) {
			const error = fieldErrors[0] as TLocalizedValidationError
			const customError = (fieldSchema as Record<string, unknown>).error as string | undefined
			errors.value[field as string] = customError || getDefaultErrorMessage(error.keyword)
			return false
		}

		clearFieldError(field)
		return true
	}

	const validate = (): boolean => {
		clearErrors()
		const currentSchema = getSchema()

		const validationErrors = [...Value.Errors(currentSchema, formData.value)]

		for (const error of validationErrors) {
			const valError = error as TLocalizedValidationError
			const path = valError.instancePath.replace(/^\//, '').split('/')[0]
			if (path && !errors.value[path]) {
				const fieldSchema = currentSchema.properties[path]
				const customError = (fieldSchema as Record<string, unknown>)?.error as string | undefined
				errors.value[path] = customError || getDefaultErrorMessage(valError.keyword)
			}
		}

		return !hasErrors.value
	}

	return {
		errors: errors as Ref<Record<string, string>>,
		validate,
		validateField,
		clearErrors,
		clearFieldError,
		hasErrors,
		getFieldError,
	}
}

function getDefaultErrorMessage(keyword: string): string {
	const errorMessages: Record<string, string> = {
		type: 'validation.invalidType',
		anyOf: 'validation.invalidUnion',
		oneOf: 'validation.invalidUnion',
		const: 'validation.invalidLiteral',
		pattern: 'validation.invalidPattern',
		minItems: 'validation.invalidArray',
		maxItems: 'validation.invalidArray',
		required: 'validation.required',
		minLength: 'validation.minLength',
		maxLength: 'validation.maxLength',
		minimum: 'validation.minimum',
		maximum: 'validation.maximum',
		exclusiveMinimum: 'validation.minimum',
		exclusiveMaximum: 'validation.maximum',
		format: 'validation.invalidFormat',
		enum: 'validation.invalidEnum',
	}

	return errorMessages[keyword] || 'validation.invalid'
}
