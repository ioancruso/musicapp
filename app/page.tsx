import Link from "next/link";

import styles from "./page.module.scss";
import { Button } from "@/components/button/button";
import { getLoggedUser } from "@/utilities/auth/auth";

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
