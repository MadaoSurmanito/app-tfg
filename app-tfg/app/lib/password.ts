// Reglas de contraseña
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_NUMBER_REGEX = /\d/;
export const PASSWORD_SYMBOL_REGEX = /[^A-Za-z0-9]/;

// Resultado de validación
export type PasswordValidationResult = {
	lengthValid: boolean;
	hasNumber: boolean;
	hasSymbol: boolean;
	score: number;
	isValid: boolean;
};

// Valida una contraseña
export function validatePassword(password: string): PasswordValidationResult {
	const lengthValid = password.length >= PASSWORD_MIN_LENGTH;
	const hasNumber = PASSWORD_NUMBER_REGEX.test(password);
	const hasSymbol = PASSWORD_SYMBOL_REGEX.test(password);

	const score = [lengthValid, hasNumber, hasSymbol].filter(Boolean).length;

	return {
		lengthValid,
		hasNumber,
		hasSymbol,
		score,
		isValid: lengthValid && hasNumber && hasSymbol,
	};
}

// Mensaje de error común
export function getPasswordValidationMessage(password: string): string | null {
	const validation = validatePassword(password);

	if (validation.isValid) {
		return null;
	}

	return "La contraseña debe tener al menos 8 caracteres, 1 número y 1 símbolo";
}
