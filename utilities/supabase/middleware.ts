import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// List of allowed routes for non-authenticated users
	const allowedRoutes = ["/about", "/"];

	// If user is not authenticated and the route is not allowed, redirect to homepage
	if (!user && !allowedRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return supabaseResponse;
}
