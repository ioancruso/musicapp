import Link from "next/link";

import styles from "./button.module.scss";

interface ButtonProps {
	text: string;
	href?: string;
	type?: "button" | "link";
	disabled?: boolean;
}

function Button({ text, href, type = "link", disabled = false }: ButtonProps) {
	const className = `${styles.button} ${disabled ? styles.nope : ""}`;

	if (type === "button") {
		return (
			<button type="submit" className={className} disabled={disabled}>
				{text}
			</button>
		);
	} else if (type === "link") {
		return (
			<Link href={href || "#"} className={className}>
				{text}
			</Link>
		);
	}
}

export { Button };
