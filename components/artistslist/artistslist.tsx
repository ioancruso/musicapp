"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	addSongToPlaylists,
	createPlaylist,
	fetchPlaylists,
	fetchSongPlaylists,
	removeSongFromPlaylists,
} from "@/utilities/serverActions";
import { userId, Artist, Album, Song, Playlist } from "@/utilities/types";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button/button";
import styles from "./artistslist.module.scss";

type ArtistsListProps = {
	artists: Artist[];
	albums: Album[];
	songs: Song[];
	userId: userId;
};

function ArtistsList({ artists, albums, songs, userId }: ArtistsListProps) {
	const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
	const [selectedSong, setSelectedSong] = useState<string | null>(null);
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
	const [newPlaylistName, setNewPlaylistName] = useState<string>("");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);
	const [initialPlaylists, setInitialPlaylists] = useState<string[]>([]);

	useEffect(() => {
		async function loadPlaylists() {
			const data = await fetchPlaylists(userId!);
			setPlaylists(data.reverse()); // Ensure newest playlists are first
		}

		loadPlaylists();
	}, [userId]);

	function selectArtist(artistId: string) {
		setSelectedArtist(artistId === selectedArtist ? null : artistId);
	}

	async function openModal(songId: string) {
		setSelectedSong(songId);
		const songPlaylists = await fetchSongPlaylists(userId!, songId);
		setSelectedPlaylists(songPlaylists);
		setInitialPlaylists(songPlaylists); // Store initial playlists for comparison
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setFeedbackMessage(null);
		setSelectedPlaylists([]);
		setNewPlaylistName("");
	}

	async function handleSave() {
		if (selectedSong) {
			const originalPlaylists = [...playlists];
			const originalSelectedPlaylists = [...selectedPlaylists];

			const playlistsToAdd = selectedPlaylists.filter(
				(id) => !initialPlaylists.includes(id)
			);
			const playlistsToRemove = initialPlaylists.filter(
				(id) => !selectedPlaylists.includes(id)
			);

			try {
				if (playlistsToAdd.length > 0) {
					await addSongToPlaylists(userId!, selectedSong, playlistsToAdd);
				}
				if (playlistsToRemove.length > 0) {
					await removeSongFromPlaylists(
						userId!,
						selectedSong,
						playlistsToRemove
					);
				}
				setFeedbackMessage("Changes saved successfully.");
				setSubmissionError(false);
			} catch (error) {
				setPlaylists(originalPlaylists);
				setSelectedPlaylists(originalSelectedPlaylists);
				setFeedbackMessage("Failed to save changes.");
				setSubmissionError(true);
			}
		}
	}

	async function handleCreatePlaylist() {
		if (newPlaylistName && selectedSong) {
			const originalPlaylists = [...playlists];

			try {
				const createdPlaylist = await createPlaylist(
					userId!,
					newPlaylistName
				);
				if (createdPlaylist) {
					setPlaylists([createdPlaylist, ...playlists]);
					await addSongToPlaylists(userId!, selectedSong, [
						createdPlaylist.id,
					]);
					setFeedbackMessage(
						"Playlist created and song added successfully."
					);
					setSubmissionError(false);
					setSelectedPlaylists((prevSelectedPlaylists) => [
						...prevSelectedPlaylists,
						createdPlaylist.id,
					]); // Include the new playlist
					setInitialPlaylists((prevInitialPlaylists) => [
						...prevInitialPlaylists,
						createdPlaylist.id,
					]); // Update initial playlists
				} else {
					throw new Error("Failed to create playlist");
				}
			} catch (error) {
				setPlaylists(originalPlaylists);
				setFeedbackMessage("Failed to create playlist and add song.");
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
		newPlaylistName ||
		JSON.stringify(selectedPlaylists) !== JSON.stringify(initialPlaylists);

	return (
		<div className={styles.artistsList}>
			{selectedArtist ? (
				<div className={styles.selectedArtistContainer}>
					<Button
						text="Back"
						type="button"
						onClick={() => setSelectedArtist(null)}
					/>
					<div className={styles.albumsGridContainer}>
						{albums
							.filter((album) => album.artist_id === selectedArtist)
							.map((album) => (
								<div key={album.id} className={styles.album}>
									<div className={styles.albumImageContainer}>
										<img
											src={album.thumbnail}
											alt={`${album.title} thumbnail`}
											className={styles.image}
										/>
									</div>
									<h2 className={styles.albumSubtitle}>
										{album.title}
									</h2>
									<ul className={styles.list}>
										{songs
											.filter((song) => song.album_id === album.id)
											.map((song) => (
												<li
													key={song.id}
													className={styles.listItem}
												>
													<span>{song.title}</span> -{" "}
													<span>{song.length}</span>
													<Button
														text="Add to Playlist"
														type="button"
														onClick={() => openModal(song.id)}
													/>
												</li>
											))}
									</ul>
								</div>
							))}
					</div>
				</div>
			) : (
				<div className={styles.gridContainer}>
					{artists.map((artist) => (
						<div
							key={artist.id}
							className={`${styles.artist} ${
								selectedArtist === artist.id
									? styles.selectedArtist
									: ""
							}`}
							onClick={() => selectArtist(artist.id)}
						>
							<div className={styles.imageContainer}>
								<img
									src={artist.thumbnail}
									alt={`${artist.name} thumbnail`}
									className={styles.image}
								/>
							</div>
							<h2 className={styles.subtitle}>{artist.name}</h2>
						</div>
					))}
				</div>
			)}
			<Modal show={showModal} onClose={closeModal}>
				<h3 className={styles.modalTitle}>Create a New Playlist</h3>
				<div className={styles.newPlaylist}>
					<input
						type="text"
						value={newPlaylistName}
						onChange={(e) => setNewPlaylistName(e.target.value)}
						placeholder="New playlist name"
						className={styles.input}
					/>
					<Button
						text="Create Playlist"
						type="button"
						onClick={handleCreatePlaylist}
					/>
				</div>
				<h3 className={styles.modalTitle}>Add to Playlists</h3>
				<div className={styles.playlistOptions}>
					<AnimatePresence>
						{playlists.map((playlist) => (
							<motion.label
								key={playlist.id}
								className={styles.playlistLabel}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								<input
									type="checkbox"
									checked={selectedPlaylists.includes(playlist.id)}
									onChange={() => togglePlaylistSelection(playlist.id)}
								/>
								{playlist.name}
							</motion.label>
						))}
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
		</div>
	);
}

export { ArtistsList };
