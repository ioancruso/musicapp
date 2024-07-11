import { cookies } from "next/headers";

import { Navigation } from "@/components/navigation/navigation";
import { getLoggedUser } from "@/utilities/auth/auth";
import { themeType } from "@/utilities/types";

import { Search } from "@/components/search/search";
import { AuthModal } from "@/components/authmodal/authmodal";

import type { Metadata } from "next";

import "./layout.scss";

export const metadata: Metadata = {
	title: {
		template: "%s | Music",
		default: "Home | Music",
	},
};

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
				<main className="mainContainer">
					<Search />
					{children}
					<AuthModal userId={userId} />
				</main>
			</body>
		</html>
	);
}
