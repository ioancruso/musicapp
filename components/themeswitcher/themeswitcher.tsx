"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import { DarkSvg } from "@/svgs/dark";
import { LightSvg } from "@/svgs/light";

import type { themeType } from "@/utilities/types";

import styles from "./themeswitcher.module.scss";

function ThemeSwitcher({ theme }: { theme: themeType }) {
	const [theTheme, setTheTheme] = useState(theme);

	function changeTheme() {
		setTheTheme(theTheme === "light" ? "dark" : "light");
	}

	useEffect(() => {
		document.cookie = `theme=${theTheme};path=/;`;
		const htmlElement = document.querySelector("html");
		if (htmlElement) {
			htmlElement.setAttribute("data-theme", theTheme);
		}
	}, [theTheme]);

	return (
		<>
			<div className={styles.wrapper}>
				<div
					className={styles.switch}
					data-ison={theTheme}
					onClick={changeTheme}
				>
					{theTheme === "light" && (
						<DarkSvg
							className={styles.dark}
							height={25}
							width={25}
							data-ison={theTheme}
						/>
					)}
					<motion.div
						className={styles.handle}
						layout
						transition={spring}
						data-ison={theTheme}
					/>
					{theTheme === "dark" && (
						<LightSvg
							className={styles.light}
							height={25}
							width={25}
							data-ison={theTheme}
						/>
					)}
				</div>
			</div>
		</>
	);
}

const spring = {
	type: "spring",
	stiffness: 600,
	damping: 50,
};

export { ThemeSwitcher };
