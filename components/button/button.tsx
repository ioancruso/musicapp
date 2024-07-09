import React from "react";
import Link from "next/link";
import styles from "./button.module.scss";

interface ButtonProps {
	text: string;
	href?: string;
	type?: "button" | "link" | "submit";
	disabled?: boolean;
	onClick?: () => void;
}

function Button({
	text,
	href = "#",
	type = "link",
	disabled = false,
	onClick,
}: ButtonProps) {
	const className = `${styles.button} ${disabled ? styles.nope : ""}`;

	if (type === "button") {
		return (
			<button
				type="button"
				className={className}
				disabled={disabled}
				onClick={onClick}
			>
				{text}
			</button>
		);
	} else if (type === "submit") {
		return (
			<button type="submit" className={className} disabled={disabled}>
				{text}
			</button>
		);
	} else {
		return (
			<Link href={href} className={className}>
				{text}
			</Link>
		);
	}
}

export { Button };
