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
	const [selectedSong, setSelectedSong] = useState<Song | null>(null);
	const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
	const [initialPlaylists, setInitialPlaylists] = useState<Playlist[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState<string>("");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);
	const [localPlaylists, setLocalPlaylists] = useState<Playlist[]>(playlists);
	const newPlaylistRef = useRef<HTMLLabelElement | null>(null);

	useEffect(() => {
		if (newPlaylistRef.current) {
			newPlaylistRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [localPlaylists]);

	async function openModal(song: Song) {
		setSelectedSong(song);

		const songPlaylists = localPlaylists.filter(
			(playlist) =>
				Array.isArray(playlist.songsOfPlaylist) &&
				playlist.songsOfPlaylist.some((s) => s.id === song.id)
		);

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
		setSelectedSong(null);
	}

	async function handleSave() {
		if (selectedSong) {
			const playlistsToAdd = selectedPlaylists.filter(
				(playlist) => !initialPlaylists.includes(playlist)
			);
			const playlistsToRemove = initialPlaylists.filter(
				(playlist) => !selectedPlaylists.includes(playlist)
			);

			try {
				if (playlistsToAdd.length > 0) {
					const { error } = await addSongToPlaylists(
						userId,
						selectedSong.id,
						playlistsToAdd.map((playlist) => playlist.id)
					);
					if (error) {
						throw new Error(error);
					}
				}
				if (playlistsToRemove.length > 0) {
					const { error } = await removeSongFromPlaylists(
						userId,
						selectedSong.id,
						playlistsToRemove.map((playlist) => playlist.id)
					);
					if (error) {
						throw new Error(error);
					}
				}

				const updatedPlaylists = localPlaylists.map((playlist) => {
					if (!Array.isArray(playlist.songsOfPlaylist)) {
						playlist.songsOfPlaylist = [];
					}
					if (playlistsToAdd.includes(playlist)) {
						return {
							...playlist,
							songsOfPlaylist: [
								...playlist.songsOfPlaylist,
								selectedSong,
							],
						};
					}
					if (playlistsToRemove.includes(playlist)) {
						return {
							...playlist,
							songsOfPlaylist: playlist.songsOfPlaylist.filter(
								(song) => song.id !== selectedSong.id
							),
						};
					}
					return playlist;
				});

				setLocalPlaylists(updatedPlaylists);
				setFeedbackMessage("Changes saved successfully.");
				setSubmissionError(false);
			} catch (error) {
				setFeedbackMessage("Failed to save changes.");
				setSubmissionError(true);
			}
		}
	}

	function handleNewPlaylistNameChange(
		e: React.ChangeEvent<HTMLInputElement>
	) {
		const newName = e.target.value;
		setNewPlaylistName(newName);
		const isValidName = /^[A-Za-z0-9 ]{2,}$/.test(newName);
		if (!isValidName) {
			setFeedbackMessage(
				"Playlist name must have at least 2 characters, only letters, numbers, and spaces are allowed."
			);
			setSubmissionError(true);
		} else {
			setFeedbackMessage(null);
			setSubmissionError(false);
		}
	}

	async function handleCreatePlaylist() {
		if (localPlaylists.length >= 20) {
			setFeedbackMessage("You can only have a maximum of 20 playlists.");
			setSubmissionError(true);
			return;
		}

		if (newPlaylistName.trim() === "") {
			setFeedbackMessage("Playlist name cannot be empty.");
			setSubmissionError(true);
			return;
		}

		if (newPlaylistName && selectedSong) {
			// Validate playlist name
			const isValidName = /^[A-Za-z0-9 ]{2,}$/.test(newPlaylistName);
			if (!isValidName) {
				setFeedbackMessage(
					"Playlist name must have at least 2 characters, only letters, numbers, and spaces are allowed."
				);
				setSubmissionError(true);
				return;
			}

			try {
				const { data: createdPlaylist, error } = await createPlaylist(
					userId,
					newPlaylistName
				);
				if (error) {
					throw new Error(error);
				}
				if (createdPlaylist) {
					setLocalPlaylists([createdPlaylist, ...localPlaylists]);
					setSelectedPlaylists([...selectedPlaylists, createdPlaylist]);
					setFeedbackMessage("Playlist created successfully.");
					setSubmissionError(false);
				}
			} catch (error) {
				setFeedbackMessage("Failed to create playlist.");
				setSubmissionError(true);
			} finally {
				setNewPlaylistName("");
			}
		}
	}

	function togglePlaylistSelection(playlist: Playlist) {
		setSelectedPlaylists((prev) =>
			prev.some((p) => p.id === playlist.id)
				? prev.filter((p) => p.id !== playlist.id)
				: [...prev, playlist]
		);
	}

	const hasChanges =
		selectedPlaylists.length !== initialPlaylists.length ||
		selectedPlaylists.some(
			(playlist) => !initialPlaylists.includes(playlist)
		);

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
						{userId && (
							<Button
								text="+"
								type="button"
								onClick={() => openModal(song)}
							/>
						)}
					</li>
				))}
			</ul>
			<Modal show={showModal} onClose={closeModal}>
				<div className={styles.newPlaylist}>
					<input
						type="text"
						value={newPlaylistName}
						onChange={handleNewPlaylistNameChange}
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
								You don't have any playlists yet
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
										checked={selectedPlaylists.some(
											(p) => p.id === playlist.id
										)}
										onChange={() => togglePlaylistSelection(playlist)}
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
