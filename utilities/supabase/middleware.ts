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
					cookiesToSet.forEach(({ name, value, options }) => {
						request.cookies.set(name, value);
						supabaseResponse = NextResponse.next({
							request,
						});
						supabaseResponse.cookies.set(name, value, options);
					});
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// List of allowed routes for non-authenticated users
	const allowedRoutes = ["/about", "/", "/artists"];

	// Check if the route is allowed for non-authenticated users
	const isAllowedRoute =
		allowedRoutes.includes(request.nextUrl.pathname) ||
		request.nextUrl.pathname.startsWith("/artists/");

	// If user is not authenticated and the route is not allowed, redirect to homepage
	if (!user && !isAllowedRoute) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return supabaseResponse;
}
