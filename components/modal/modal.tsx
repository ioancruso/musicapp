import { useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./modal.module.scss";

interface ModalProps {
	show: boolean;
	onClose: () => void;
	children: ReactNode;
}

function Modal({ show, onClose, children }: ModalProps) {
	useEffect(() => {
		function preventScroll(e: Event) {
			e.preventDefault();
		}

		if (show) {
			window.addEventListener("touchmove", preventScroll, {
				passive: false,
			});
			window.addEventListener("wheel", preventScroll, { passive: false });
		}

		return () => {
			window.removeEventListener("touchmove", preventScroll);
			window.removeEventListener("wheel", preventScroll);
		};
	}, [show]);

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					className={styles.modalBackdrop}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					style={{ display: "flex" }}
				>
					<motion.div
						className={styles.modalContent}
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0.8 }}
						transition={{ duration: 0.3 }}
					>
						<button className={styles.closeButton} onClick={onClose}>
							X
						</button>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export { Modal };
