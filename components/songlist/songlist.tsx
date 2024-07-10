"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Song, Playlist, userId } from "@/utilities/types";
import {
	addSongToPlaylists,
	createPlaylist,
	removeSongFromPlaylists,
} from "@/utilities/serverActions";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button/button";

import styles from "./songlist.module.scss";

interface SongsListProps {
	songs: Song[];
	playlists: Playlist[];
	userId: userId;
}

function SongsList({ songs, playlists, userId }: SongsListProps) {
	const [selectedSong, setSelectedSong] = useState<string | null>(null);
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
	const [initialPlaylists, setInitialPlaylists] = useState<string[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState<string>("");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);
	const [localPlaylists, setLocalPlaylists] = useState<Playlist[]>(playlists);
	const newPlaylistRef = useRef<HTMLLabelElement | null>(null);

	useEffect(() => {
		const handleResize = () => {
			if (showModal) {
				closeModal();
			}
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [showModal]);

	useEffect(() => {
		if (showModal) {
			document.documentElement.classList.add(styles.noScroll);
		} else {
			document.documentElement.classList.remove(styles.noScroll);
		}

		return () => {
			document.documentElement.classList.remove(styles.noScroll);
		};
	}, [showModal]);

	useEffect(() => {
		if (newPlaylistRef.current) {
			newPlaylistRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [localPlaylists]);

	async function openModal(songId: string) {
		setSelectedSong(songId);
		const songPlaylists = playlists
			.filter((playlist) => playlist.songs?.includes(songId))
			.map((playlist) => playlist.id);
		setSelectedPlaylists(songPlaylists);
		setInitialPlaylists(songPlaylists);
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setFeedbackMessage(null);
		setSelectedPlaylists([]);
		setInitialPlaylists([]);
		setNewPlaylistName("");
	}

	async function handleSave() {
		if (selectedSong) {
			const playlistsToAdd = selectedPlaylists.filter(
				(id) => !initialPlaylists.includes(id)
			);
			const playlistsToRemove = initialPlaylists.filter(
				(id) => !selectedPlaylists.includes(id)
			);

			try {
				if (playlistsToAdd.length > 0) {
					await addSongToPlaylists(userId, selectedSong, playlistsToAdd);
				}
				if (playlistsToRemove.length > 0) {
					await removeSongFromPlaylists(
						userId,
						selectedSong,
						playlistsToRemove
					);
				}
				setFeedbackMessage("Changes saved successfully.");
				setSubmissionError(false);
			} catch (error) {
				setFeedbackMessage("Failed to save changes.");
				setSubmissionError(true);
			}
		}
	}

	async function handleCreatePlaylist() {
		if (newPlaylistName && selectedSong) {
			try {
				const createdPlaylist = await createPlaylist(
					userId,
					newPlaylistName
				);
				if (createdPlaylist) {
					setLocalPlaylists([createdPlaylist, ...localPlaylists]);

					setFeedbackMessage("Playlist created successfully.");
					setSubmissionError(false);
				} else {
					throw new Error("Failed to create playlist");
				}
			} catch (error) {
				setFeedbackMessage("Failed to create playlist.");
				setSubmissionError(true);
			} finally {
				setNewPlaylistName("");
			}
		}
	}

	function togglePlaylistSelection(playlistId: string) {
		setSelectedPlaylists((prev) =>
			prev.includes(playlistId)
				? prev.filter((id) => id !== playlistId)
				: [...prev, playlistId]
		);
	}

	const hasChanges =
		selectedPlaylists.length !== initialPlaylists.length ||
		selectedPlaylists.some((id) => !initialPlaylists.includes(id));

	return (
		<>
			<ul className={styles.list}>
				{songs.map((song) => (
					<li
						key={song.id}
						id={`song-${song.id}`}
						className={styles.listItem}
					>
						<span>{song.title}</span>
						<span>Duration: {song.length}</span>
						<Button
							text="+"
							type="button"
							onClick={() => openModal(song.id)}
						/>
					</li>
				))}
			</ul>
			<Modal show={showModal} onClose={closeModal}>
				<h3 className={styles.modalTitle}>Create a New Playlist</h3>
				<div className={styles.newPlaylist}>
					<input
						type="text"
						value={newPlaylistName}
						onChange={(e) => setNewPlaylistName(e.target.value)}
						placeholder="New playlist name"
						maxLength={9}
					/>
					<Button
						text="Create"
						type="button"
						onClick={handleCreatePlaylist}
					/>
				</div>
				<h3 className={styles.modalTitle}>Add to Playlists</h3>
				<div
					className={styles.playlistOptions}
					onWheel={(e) => e.stopPropagation()}
				>
					<AnimatePresence>
						{localPlaylists.length === 0 ? (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
								className={styles.noPlaylists}
							>
								No Playlists
							</motion.div>
						) : (
							localPlaylists.map((playlist, index) => (
								<motion.label
									key={playlist.id}
									className={styles.playlistLabel}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
									ref={index === 0 ? newPlaylistRef : null}
								>
									<input
										type="checkbox"
										checked={selectedPlaylists.includes(playlist.id)}
										onChange={() =>
											togglePlaylistSelection(playlist.id)
										}
									/>
									{playlist.name}
								</motion.label>
							))
						)}
					</AnimatePresence>
				</div>
				<Button
					text="Save"
					type="button"
					onClick={handleSave}
					disabled={!hasChanges}
				/>
				{feedbackMessage ? (
					<div
						className={`${styles.dialogue} ${
							submissionError ? styles.fail : styles.success
						}`}
					>
						{feedbackMessage}
					</div>
				) : (
					<div className={styles.empty} />
				)}
			</Modal>
		</>
	);
}

export { SongsList };
