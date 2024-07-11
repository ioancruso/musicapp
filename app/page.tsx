import { Button } from "@/components/button/button";
import { getLoggedUser } from "@/utilities/auth/auth";

import { Metadata } from "next/types";

import styles from "./page.module.scss";

export const metadata: Metadata = {
	title: "Home | Music",
};

export default async function Home() {
	const userId = await getLoggedUser();
	return (
		<div className={styles.welcome}>
			Welcome to the Music App!
			{!userId && (
				<div>
					<Button text="Get started" href="/?auth=register" type="link" />
				</div>
			)}
		</div>
	);
}
