import { auth } from "@/auth";
import { NextResponse, userAgent } from "next/server";

// -----------------------------------------------------------------------------
// HELPERS DE COMPATIBILIDAD DE NAVEGADOR
// -----------------------------------------------------------------------------
// Compara dos versiones en formato "16.4", "15.6.1", etc.
// Devuelve:
// -1 si current < minimum
//  0 si current === minimum
//  1 si current > minimum
function compareVersions(current: string, minimum: string) {
	const currentParts = current.split(".").map((part) => Number(part) || 0);
	const minimumParts = minimum.split(".").map((part) => Number(part) || 0);
	const maxLength = Math.max(currentParts.length, minimumParts.length);

	for (let i = 0; i < maxLength; i += 1) {
		const currentValue = currentParts[i] ?? 0;
		const minimumValue = minimumParts[i] ?? 0;

		if (currentValue > minimumValue) return 1;
		if (currentValue < minimumValue) return -1;
	}

	return 0;
}

// Determina si el navegador está por debajo del soporte mínimo que queremos aceptar.
// Next.js marca como baseline moderno Safari 16.4+, Chrome 111+, Edge 111+ y Firefox 111+.
// En iPhone/iPad antiguos, aunque uses Chrome u otro navegador, por debajo siguen
// dependiendo de WebKit/iOS y suelen compartir las mismas limitaciones de compatibilidad.
function isUnsupportedBrowser(req: Parameters<typeof userAgent>[0]) {
	const { browser, os } = userAgent(req);

	const browserName = (browser.name ?? "").toLowerCase();
	const browserVersion = browser.version ?? "0";
	const osName = (os.name ?? "").toLowerCase();
	const osVersion = os.version ?? "0";

	// iPhone / iPad antiguos
	if (
		(osName.includes("ios") || osName.includes("ipad")) &&
		compareVersions(osVersion, "16.4") < 0
	) {
		return true;
	}

	// Safari de macOS antiguo
	if (
		browserName.includes("safari") &&
		!browserName.includes("chrome") &&
		!browserName.includes("chromium") &&
		compareVersions(browserVersion, "16.4") < 0
	) {
		return true;
	}

	// Chrome antiguo
	if (
		browserName.includes("chrome") &&
		!browserName.includes("edge") &&
		compareVersions(browserVersion, "111") < 0
	) {
		return true;
	}

	// Edge antiguo
	if (
		browserName.includes("edge") &&
		compareVersions(browserVersion, "111") < 0
	) {
		return true;
	}

	// Firefox antiguo
	if (
		browserName.includes("firefox") &&
		compareVersions(browserVersion, "111") < 0
	) {
		return true;
	}

	return false;
}

// -----------------------------------------------------------------------------
// PROXY PRINCIPAL
// -----------------------------------------------------------------------------
// Este proxy se ejecuta antes de servir las rutas que indique el matcher.
// Aquí centralizamos:
//
// 1. Bloqueo de navegadores no compatibles.
// 2. Protección de rutas privadas.
// 3. Redirección según rol si un usuario autenticado intenta entrar en login/register.
//
// En Next.js 16, el archivo recomendado es proxy.ts en la raíz del proyecto,
// y puede hacer redirecciones antes de completar la request.
export default auth((req) => {
	const { nextUrl } = req;
	const session = req.auth;
	const pathname = nextUrl.pathname;

	// -------------------------------------------------------------------------
	// CONTROL DE COMPATIBILIDAD DE NAVEGADOR
	// -------------------------------------------------------------------------
	// Si el navegador no es compatible, redirigimos a una página informativa
	// antes de que intente cargar el resto de la aplicación.
	if (isUnsupportedBrowser(req)) {
		const unsupportedUrl = new URL("/unsupported-browser", nextUrl);
		unsupportedUrl.searchParams.set("from", pathname);

		return NextResponse.redirect(unsupportedUrl);
	}

	// -------------------------------------------------------------------------
	// DATOS DE SESIÓN Y CONTEXTO DE RUTA
	// -------------------------------------------------------------------------
	const isLoggedIn = !!session?.user;
	const role = session?.user?.role;

	const isAdminRoute = pathname.startsWith("/admin");
	const isCommercialRoute = pathname.startsWith("/comerciales");
	const isClientRoute = pathname.startsWith("/clientes");

	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/register");

	// -------------------------------------------------------------------------
	// PROTECCIÓN DE RUTAS PRIVADAS
	// -------------------------------------------------------------------------
	// Si el usuario no está autenticado y trata de entrar a una zona privada,
	// lo enviamos al login.
	if (!isLoggedIn && (isAdminRoute || isCommercialRoute || isClientRoute)) {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	// -------------------------------------------------------------------------
	// EVITAR QUE UN USUARIO AUTENTICADO VUELVA A LOGIN / REGISTER
	// -------------------------------------------------------------------------
	// Si ya tiene sesión iniciada, lo redirigimos a su panel correspondiente.
	if (isLoggedIn && isAuthRoute) {
		if (role === "admin") {
			return NextResponse.redirect(new URL("/admin", nextUrl));
		}

		if (role === "commercial") {
			return NextResponse.redirect(new URL("/comerciales", nextUrl));
		}

		if (role === "client") {
			return NextResponse.redirect(new URL("/clientes", nextUrl));
		}
	}

	// -------------------------------------------------------------------------
	// RESTRICCIÓN POR ROL
	// -------------------------------------------------------------------------
	// Si el usuario intenta entrar en una zona que no corresponde a su rol,
	// se le redirige al login.
	if (isAdminRoute && role !== "admin") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isCommercialRoute && role !== "commercial") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isClientRoute && role !== "client") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	// Si no se ha activado ninguna redirección, dejamos continuar la request.
	return NextResponse.next();
});

// -----------------------------------------------------------------------------
// MATCHER
// -----------------------------------------------------------------------------
// Hacemos que el proxy se aplique prácticamente a toda la aplicación,
// excluyendo:
// - API routes
// - recursos internos de Next
// - favicon
// - manifest
// - la propia página de navegador no compatible
//
// Esto es importante porque, si solo matcheáramos /admin, /login, etc.,
// el bloqueo por navegador antiguo no se aplicaría al resto de páginas.
export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|unsupported-browser).*)",
	],
};
