"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClientAuth } from "@/utilities/supabase/supabase_auth";

import type { userId } from "../types";

export async function getLoggedUser() {
	const supabase = createClientAuth();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let userId: userId = null;

	if (user) {
		userId = user.id;
	}

	return userId;
}

export async function Login(formData: FormData) {
	const email = String(formData.get("email"));
	const password = String(formData.get("password"));
	const supabase = createClientAuth();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return { error: { message: error.message } };
	}
	return { error: null };
}

export async function Register(formData: FormData) {
	const email = String(formData.get("email"));
	const password = String(formData.get("password"));

	const supabase = createClientAuth();

	const { error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) {
		console.log(error);
		return { error: { message: error.message } };
	}
	return { error: null };
}
export async function Reset(formData: FormData) {
	const URL = headers().get("origin");

	const supabase = createClientAuth();

	const email = String(formData.get("email"));

	try {
		await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: URL!,
		});
	} catch (error) {
		return { error: error as Error };
	}
	return { error: null };
}
export async function Change(formData: FormData) {
	const supabase = createClientAuth();

	const password = String(formData.get("password"));

	try {
		await supabase.auth.updateUser({
			password: password,
		});
	} catch (error) {
		return { error: error as Error };
	}
	return { error: null };
}

export async function signOut() {
	const supabase = createClientAuth();

	await supabase.auth.signOut();

	redirect("/");
}
