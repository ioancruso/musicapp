import Link from "next/link";

import styles from "./page.module.scss";
import { Button } from "@/components/button/button";

export default function Home() {
	return (
		<div className={styles.welcome}>
			Welcome to the Music App!
			<div>
				<Button text="About this app" href="/about" type="link" />
			</div>
		</div>
	);
}
