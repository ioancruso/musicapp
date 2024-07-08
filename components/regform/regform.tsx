"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button/button";

import { Register } from "@/utilities/auth/auth";

import styles from "./regform.module.scss";

const EMAIL_MIN_LENGTH = 5;
const EMAIL_MAX_LENGTH = 60;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

interface FormValues {
	email: string;
	password: string;
}

function validateField(
	name: keyof FormValues,
	value: string,
	submit?: boolean
): string {
	const length = value.length;
	const limits = {
		email: { min: EMAIL_MIN_LENGTH, max: EMAIL_MAX_LENGTH },
		password: { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH },
	};

	if (submit && (!value || value === "")) {
		return "This field is required.";
	}

	if (length < limits[name].min && submit) {
		return `Length must be between ${limits[name].min} and ${limits[name].max} characters.`;
	}

	if (length > limits[name].max) {
		return `Length must be between ${limits[name].min} and ${limits[name].max} characters.`;
	}

	if (
		name === "email" &&
		value !== "" &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
	) {
		return "Please enter a valid email address.";
	}

	return "";
}

function RegForm() {
	const [message, setMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);

	const router = useRouter();

	const [formValues, setFormValues] = useState<FormValues>({
		email: "",
		password: "",
	});

	const [validationErrors, setValidationErrors] = useState<FormValues>({
		email: "",
		password: "",
	});

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;

		const validationError = validateField(name as keyof FormValues, value);

		setFormValues((prevValues) => ({
			...prevValues,
			[name]: value,
		}));

		setValidationErrors((prevErrors) => ({
			...prevErrors,
			[name]: validationError,
		}));
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		// Revalidate all fields
		const newValidationErrors: FormValues = {
			email: validateField("email", formValues.email, true),
			password: validateField("password", formValues.password, true),
		};

		setValidationErrors(newValidationErrors);

		// Check if there are any errors
		if (Object.values(newValidationErrors).some((error) => error !== "")) {
			return;
		}

		const formData = new FormData(event.currentTarget as HTMLFormElement);
		const { error } = await Register(formData);

		if (error) {
			setSubmissionError(true);
			setMessage(error.message);
		} else {
			setSubmissionError(false);
			setFormValues({
				email: "",
				password: "",
			});
			setValidationErrors({
				email: "",
				password: "",
			});
		}
	}

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className={styles.registerForm}
				noValidate
				autoComplete="off"
			>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					name="email"
					type="text"
					placeholder="Enter your email address"
					autoComplete="off"
					value={formValues.email}
					className={!validationErrors.email ? "" : styles.invalid}
					onChange={handleInputChange}
				/>
				<div className={styles.errorContainer}>
					{validationErrors.email && (
						<div className={styles.errorMessage}>
							{validationErrors.email}
						</div>
					)}
				</div>

				<label htmlFor="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="Enter your password"
					autoComplete="off"
					value={formValues.password}
					className={!validationErrors.password ? "" : styles.invalid}
					onChange={handleInputChange}
				/>
				<div className={styles.errorContainer}>
					{validationErrors.password && (
						<div className={styles.errorMessage}>
							{validationErrors.password}
						</div>
					)}
				</div>

				<Button
					text="Create Account"
					type="button"
					disabled={Object.values(validationErrors).some(
						(error) => error !== ""
					)}
				/>
			</form>

			{message ? (
				<div
					className={`${styles.dialogue} ${
						submissionError ? styles.fail : styles.succes
					}`}
				>
					{message}
				</div>
			) : (
				<div className={styles.empty} />
			)}
			<div className={styles.orSeparator}>or</div>
			<div className={styles.login}>
				<h2>You already have an account?</h2>
				<Button text="Login" href="?auth=login" />
			</div>
		</>
	);
}

export { RegForm };
