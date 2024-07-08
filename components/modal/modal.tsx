import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./modal.module.scss";

interface ModalProps {
	show: boolean;
	onClose: () => void;
	children: ReactNode;
}

function Modal(props: ModalProps) {
	const { show, onClose, children } = props;

	return (
		<motion.div
			className={styles.modalBackdrop}
			initial={{ opacity: 0 }}
			animate={{ opacity: show ? 1 : 0 }}
			transition={{ duration: 0.3 }}
			style={{ display: show ? "flex" : "none" }}
		>
			<motion.div
				className={styles.modalContent}
				initial={{ scale: 0.8 }}
				animate={{ scale: show ? 1 : 0.8 }}
				transition={{ duration: 0.3 }}
			>
				<button className={styles.closeButton} onClick={onClose}>
					X
				</button>
				{children}
			</motion.div>
		</motion.div>
	);
}

export { Modal };
