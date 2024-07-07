import { createBrowserClient } from "@supabase/ssr";

function createClientService() {
	return createBrowserClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE!
	);
}

export { createClientService };
