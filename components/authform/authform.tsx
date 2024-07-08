"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";

import { Login } from "@/utilities/auth/auth";
import { Button } from "@/components/button/button";

import styles from "./AuthForm.module.scss";

interface FormState {
	email: string;
	password: string;
}

interface AuthFormProps {
	closeModal: () => void;
}

function AuthForm({ closeModal }: AuthFormProps) {
	const [formState, setFormState] = useState<FormState>({
		email: "",
		password: "",
	});
	const [message, setMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);

	const router = useRouter();

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const { error } = await Login(formData);

		if (error) {
			if (error.message) {
				setMessage(error.message);
			}

			setFormState((prevState) => ({
				...prevState,
				password: "",
			}));
			setSubmissionError(true);
		} else {
			router.push("/");
			router.refresh();
			setTimeout(() => {
				closeModal();
			}, 500); // Close modal after 2 seconds
		}
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormState((prevState) => ({
			...prevState,
			[name]: value,
		}));
		setMessage(null);
		setSubmissionError(false);
	}

	return (
		<>
			<form className={styles.loginForm} onSubmit={handleSubmit}>
				<label htmlFor="email-id">Email Address</label>
				<input
					id="email-id"
					name="email"
					type="email"
					placeholder="Enter your email address"
					value={formState.email}
					onChange={handleInputChange}
					required
				/>

				<label htmlFor="password-id">Password</label>
				<input
					id="password-id"
					name="password"
					type="password"
					placeholder="Enter your password"
					value={formState.password}
					onChange={handleInputChange}
					required
				/>

				<div className={styles.loginPassword}>
					<Link className={styles.forgotPassword} href="/reset">
						Forgot Password?
					</Link>
					<Button text="Login" type="button" />
				</div>
			</form>

			{message ? (
				<div
					className={`${styles.dialogue} ${
						submissionError ? styles.fail : styles.success
					}`}
				>
					{message}
				</div>
			) : (
				<div className={styles.empty} />
			)}
		</>
	);
}

export { AuthForm };
