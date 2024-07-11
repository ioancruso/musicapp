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
		if (show) {
			// Disable scroll by setting overflow hidden
			document.body.style.overflow = "hidden";
		} else {
			// Re-enable scroll by removing the overflow hidden
			document.body.style.overflow = "";
		}

		// Clean up by removing the overflow hidden when component is unmounted
		return () => {
			document.body.style.overflow = "";
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
