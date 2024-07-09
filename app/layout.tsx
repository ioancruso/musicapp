import { cookies } from "next/headers";

import { Navigation } from "@/components/navigation/navigation";
import { getLoggedUser } from "@/utilities/auth/auth";
import { themeType } from "@/utilities/types";

import "./layout.scss";

export const dynamic = "force-dynamic";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = cookies();
	const cookie = cookieStore.get("theme");
	let theme: string = "dark";

	if (cookie) {
		theme = cookie.value;
	}

	const userId = await getLoggedUser();

	return (
		<html lang="en" data-theme={theme}>
			<body>
				<Navigation userId={userId} theme={theme as themeType} />
				<main className="mainContainer">{children}</main>
			</body>
		</html>
	);
}
