"use client";

import { useEffect, useState } from "react";

type SafeFormProps = Omit<
	React.FormHTMLAttributes<HTMLFormElement>,
	"method"
> & {
	children: React.ReactNode;
	disableUntilHydrated?: boolean;
};

/**
 * Formulario seguro por defecto para toda la app.
 *
 * Objetivos:
 * - Evitar que el navegador haga GET por defecto si React todavía no ha hidratado.
 * - Forzar siempre method="post".
 * - Permitir seguir usando onSubmit, action, className, etc.
 * - Opcionalmente bloquear la interacción hasta que el cliente esté hidratado.
 */
export default function SafeForm({
	children,
	action = "#",
	onSubmit,
	className = "",
	noValidate = true,
	disableUntilHydrated = true,
	...props
}: SafeFormProps) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	return (
		<form
			method="post"
			action={action}
			onSubmit={onSubmit}
			className={className}
			noValidate={noValidate}
			{...props}
		>
			<fieldset
				disabled={disableUntilHydrated && !isHydrated}
				className="contents"
			>
				{children}
			</fieldset>
		</form>
	);
}
