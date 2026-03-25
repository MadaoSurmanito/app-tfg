import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const { nextUrl } = req;
	const session = req.auth;

	const isLoggedIn = !!session?.user;
	const role = session?.user?.role;
	const pathname = nextUrl.pathname;

	const isAdminRoute = pathname.startsWith("/admin");
	const isCommercialRoute = pathname.startsWith("/comerciales");
	const isClientRoute = pathname.startsWith("/clientes");
	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/register");

	if (!isLoggedIn && (isAdminRoute || isCommercialRoute || isClientRoute)) {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

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

	if (isAdminRoute && role !== "admin") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isCommercialRoute && role !== "commercial") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isClientRoute && role !== "client") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/admin/:path*",
		"/comerciales/:path*",
		"/clientes/:path*",
		"/login",
		"/register",
	],
};
