"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "../modal/modal";
import { AuthForm } from "../authform/authform";
import { RegForm } from "../regform/regform";

interface AuthModalProps {
	userId: string | null;
}

export function AuthModal({ userId }: AuthModalProps) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [modalContent, setModalContent] = useState<string>("");

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		const authParam = searchParams.get("auth");
		if (authParam) {
			setModalContent(authParam);
			setShowModal(true);
		} else {
			setShowModal(false);
		}
	}, [searchParams]);

	function closeModal() {
		setShowModal(false);
		setModalContent("");
		const newSearchParams = new URLSearchParams(searchParams.toString());
		newSearchParams.delete("auth");
		router.replace(`${pathname}?${newSearchParams.toString()}`);
	}

	return (
		<>
			{!userId && (
				<Modal show={showModal} onClose={closeModal}>
					{modalContent === "login" && (
						<AuthForm closeModal={closeModal} />
					)}
					{modalContent === "register" && (
						<RegForm closeModal={closeModal} />
					)}
				</Modal>
			)}
		</>
	);
}
