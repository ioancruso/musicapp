"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Song, Playlist, userId } from "@/utilities/types";
import {
	removeSongFromPlaylists,
	updatePlaylistName,
	deletePlaylist,
} from "@/utilities/serverActions";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button/button";
import styles from "./playlists.module.scss";

interface PlaylistsProps {
	playlists: Playlist[];
	userId: userId;
}

function Playlists({ playlists, userId }: PlaylistsProps) {
	if (!playlists || playlists.length < 1) {
		return (
			<div className={styles.nothing}>You don't have any playlist yet</div>
		);
	}

	const [showModal, setShowModal] = useState(false);
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
		null
	);
	const [initialSongs, setInitialSongs] = useState<Song[]>([]);
	const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
	const [initialPlaylistName, setInitialPlaylistName] = useState<string>("");
	const [playlistName, setPlaylistName] = useState<string>("");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);
	const [localPlaylists, setLocalPlaylists] = useState<Playlist[]>(playlists);
	const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);

	function openModal(playlist: Playlist) {
		setSelectedPlaylist(playlist);
		setInitialSongs(playlist.songsOfPlaylist);
		setSelectedSongs(playlist.songsOfPlaylist);
		setInitialPlaylistName(playlist.name);
		setPlaylistName(playlist.name);
		setShowModal(true);
		setFeedbackMessage(null);
		setSubmissionError(false);
		setIsSaveDisabled(false);
	}

	function closeModal() {
		setShowModal(false);
		setSelectedPlaylist(null);
		setSelectedSongs([]);
		setInitialSongs([]);
		setInitialPlaylistName("");
		setPlaylistName("");
		setFeedbackMessage(null);
		setSubmissionError(false);
		setIsSaveDisabled(false);
	}

	function handleSongToggle(song: Song) {
		setSelectedSongs((prevSongs) =>
			prevSongs.some((s) => s.id === song.id)
				? prevSongs.filter((s) => s.id !== song.id)
				: [...prevSongs, song]
		);
	}

	function hasChanges() {
		return (
			initialPlaylistName !== playlistName ||
			initialSongs.length !== selectedSongs.length ||
			initialSongs.some((song) => !selectedSongs.includes(song))
		);
	}

	function handlePlaylistNameChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newName = e.target.value;
		setPlaylistName(newName);
		const isValidName = /^[A-Za-z0-9 ]{2,}$/.test(newName);
		if (!isValidName) {
			setFeedbackMessage(
				"Playlist name must have at least 2 characters, only letters, numbers, and spaces are allowed."
			);
			setSubmissionError(true);
			setIsSaveDisabled(true);
		} else {
			setFeedbackMessage(null);
			setSubmissionError(false);
			setIsSaveDisabled(false);
		}
	}

	async function handleSave() {
		if (selectedPlaylist && hasChanges()) {
			const previousPlaylists = [...localPlaylists];
			try {
				const songsToRemove = initialSongs.filter(
					(song) => !selectedSongs.includes(song)
				);

				// Optimistically update the local state
				const updatedPlaylists = localPlaylists.map((playlist) =>
					playlist.id === selectedPlaylist.id
						? {
								...playlist,
								name: playlistName,
								songsOfPlaylist: selectedSongs,
						  }
						: playlist
				);
				setLocalPlaylists(updatedPlaylists);

				if (songsToRemove.length > 0) {
					const { error } = await removeSongFromPlaylists(
						userId,
						selectedPlaylist.id,
						songsToRemove.map((song) => song.id)
					);
					if (error) {
						throw new Error(error);
					}
				}

				// Update the playlist name if it has changed
				if (initialPlaylistName !== playlistName) {
					const { error } = await updatePlaylistName(
						userId,
						selectedPlaylist.id,
						playlistName
					);
					if (error) {
						throw new Error(error);
					}
				}

				setFeedbackMessage("Playlist updated successfully.");
				setSubmissionError(false);

				// Update the initial state with the new changes
				setInitialSongs(selectedSongs);
				setInitialPlaylistName(playlistName);
			} catch (error) {
				console.error("Error saving playlist changes:", error);
				setFeedbackMessage("Failed to update playlist.");
				setSubmissionError(true);

				// Revert to previous state in case of an error
				setLocalPlaylists(previousPlaylists);
			}
		}
	}

	async function handleDelete() {
		const previousPlaylists = [...localPlaylists];
		if (selectedPlaylist) {
			try {
				// Optimistically update the local state
				setLocalPlaylists(
					localPlaylists.filter((p) => p.id !== selectedPlaylist.id)
				);

				const { error } = await deletePlaylist(userId, selectedPlaylist.id);
				if (error) {
					throw new Error(error);
				}

				setFeedbackMessage("Playlist deleted successfully.");
				setSubmissionError(false);

				// Close the modal and reset state only if there's no error
				closeModal();
			} catch (error) {
				console.error("Error deleting playlist:", error);
				setFeedbackMessage("Failed to delete playlist.");
				setSubmissionError(true);

				// Revert to previous state in case of an error
				setLocalPlaylists(previousPlaylists);
			}
		}
	}

	return (
		<div className={styles.playlistsGrid}>
			{localPlaylists.map((playlist) => (
				<motion.div
					key={playlist.id}
					className={styles.playlist}
					onClick={() => openModal(playlist)}
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.3 }}
				>
					<h3 className={styles.playlistTitle}>{playlist.name}</h3>
					<p>{playlist.songsOfPlaylist.length} songs</p>
				</motion.div>
			))}

			{selectedPlaylist && (
				<Modal show={showModal} onClose={closeModal}>
					<input
						type="text"
						value={playlistName}
						onChange={handlePlaylistNameChange}
						placeholder="Playlist name"
						maxLength={9}
						className={styles.playlistName}
					/>

					<h3 className={styles.modalTitle}>Songs in Playlist</h3>
					{selectedPlaylist.songsOfPlaylist &&
					selectedPlaylist.songsOfPlaylist.length > 0 ? (
						<div className={styles.songList}>
							{selectedPlaylist.songsOfPlaylist.map((song) => (
								<div key={song.id} className={styles.songItem}>
									<input
										type="checkbox"
										checked={selectedSongs.some(
											(s) => s.id === song.id
										)}
										onChange={() => handleSongToggle(song)}
									/>
									{song.title}
								</div>
							))}
						</div>
					) : (
						<div className={styles.noSong}>
							This playlist doesn't have any songs yet
						</div>
					)}
					<div className={styles.buttonsWrapper}>
						<Button
							text="Save"
							type="button"
							onClick={handleSave}
							disabled={!hasChanges() || isSaveDisabled}
						/>
						<Button text="Delete" type="button" onClick={handleDelete} />
					</div>
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
			)}
		</div>
	);
}

export { Playlists };
