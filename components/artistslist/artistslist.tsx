"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import {
	addSongToPlaylists,
	createPlaylist,
	fetchPlaylists,
	fetchSongPlaylists,
	removeSongFromPlaylists,
	searchSuggestions,
} from "@/utilities/serverActions";
import { userId, Artist, Album, Song, Playlist } from "@/utilities/types";

import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button/button";
import { Search } from "@/components/search/search";

import styles from "./artistslist.module.scss";

interface ArtistsListProps {
	artists: Artist[];
	albums: Album[];
	songs: Song[];
	userId: userId;
	selectedArtistTitle: string | null;
}

interface SearchResult {
	type: "artist" | "album" | "song";
	data: Artist | Album | Song;
}

function ArtistsList({
	artists,
	albums,
	songs,
	userId,
	selectedArtistTitle,
}: ArtistsListProps) {
	const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
	const [selectedSong, setSelectedSong] = useState<string | null>(null);
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
	const [newPlaylistName, setNewPlaylistName] = useState<string>("");
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [submissionError, setSubmissionError] = useState<boolean>(false);
	const [initialPlaylists, setInitialPlaylists] = useState<string[]>([]);
	const router = useRouter();

	useEffect(() => {
		async function loadPlaylists() {
			const data = await fetchPlaylists(userId);
			setPlaylists(data.reverse());
		}

		loadPlaylists();
	}, [userId]);

	useEffect(() => {
		if (selectedArtistTitle) {
			const decodedTitle = decodeURIComponent(selectedArtistTitle);
			const artist = artists.find((artist) => artist.name === decodedTitle);
			if (artist) {
				setSelectedArtist(artist.id);
			}
		} else {
			setSelectedArtist(null);
		}
	}, [selectedArtistTitle, artists]);

	function handleSelect(result: SearchResult) {
		const artistId =
			result.type === "artist"
				? (result.data as Artist).id
				: result.type === "album"
				? (result.data as Album).artist_id
				: albums.find(
						(album) => album.id === (result.data as Song).album_id
				  )?.artist_id;

		if (artistId) {
			setSelectedArtist(artistId);

			if (result.type === "album") {
				scrollToAlbum(result.data as Album, () => {
					highlightSelected(result);
				});
			} else if (result.type === "artist") {
				highlightSelected(result);
			} else if (result.type === "song") {
				scrollToSong(result.data as Song, () => {
					highlightSelected(result);
				});
			}

			const artist = artists.find((artist) => artist.id === artistId);
			if (artist) {
				const encodedTitle = encodeURIComponent(artist.name);
				router.push(`/artists?artist=${encodedTitle}`);
			}
		}
	}

	function scrollToAlbum(album: Album, callback: () => void) {
		setTimeout(() => {
			const albumElement = document.getElementById(`album-${album.id}`);
			if (albumElement) {
				albumElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				setTimeout(callback, 100);
			}
		}, 300);
	}

	function scrollToSong(song: Song, callback: () => void) {
		setTimeout(() => {
			const songElement = document.getElementById(`song-${song.id}`);
			if (songElement) {
				songElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				setTimeout(callback, 100);
			}
		}, 300);
	}

	function highlightElement(selector: string, className: string) {
		setTimeout(() => {
			const element = document.querySelector(selector);
			if (element) {
				element.classList.add(styles[className]);
				setTimeout(() => {
					element.classList.remove(styles[className]);
				}, 5000);
			}
		}, 300);
	}

	function highlightSelected(result: SearchResult) {
		if (result.type === "artist" || result.type === "album") {
			const selector = `#${result.type}-${result.data.id}`;
			highlightElement(selector, "highlightedText");
		} else if (result.type === "song") {
			const selector = `#song-${result.data.id}`;
			highlightElement(selector, "highlightedBackground");
		}
	}

	async function openModal(songId: string) {
		setSelectedSong(songId);
		const songPlaylists = await fetchSongPlaylists(userId, songId);
		setSelectedPlaylists(songPlaylists);
		setInitialPlaylists(songPlaylists);
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
					userId,
					newPlaylistName
				);
				if (createdPlaylist) {
					setPlaylists([createdPlaylist, ...playlists]);
					await addSongToPlaylists(userId, selectedSong, [
						createdPlaylist.id,
					]);
					setFeedbackMessage(
						"Playlist created and song added successfully."
					);
					setSubmissionError(false);
					setSelectedPlaylists((prevSelectedPlaylists) => [
						...prevSelectedPlaylists,
						createdPlaylist.id,
					]);
					setInitialPlaylists((prevInitialPlaylists) => [
						...prevInitialPlaylists,
						createdPlaylist.id,
					]);
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

	function selectArtist(artistId: string | null) {
		setSelectedArtist(artistId);
		if (artistId) {
			const artist = artists.find((artist) => artist.id === artistId);
			if (artist) {
				const encodedTitle = encodeURIComponent(artist.name);
				router.push(`/artists?artist=${encodedTitle}`);
			}
		} else {
			router.push(`/artists`);
		}
	}

	return (
		<div className={styles.artistsList}>
			<Search fetchSuggestions={searchSuggestions} onSelect={handleSelect} />
			{selectedArtist ? (
				<div className={styles.selectedArtistContainer}>
					<h2
						className={styles.artistTitle}
						id={`artist-${selectedArtist}`}
					>
						Albums of{" "}
						{artists.find((artist) => artist.id === selectedArtist)?.name}
					</h2>
					<Button
						text="Back"
						type="button"
						onClick={() => selectArtist(null)}
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
									<h2
										className={styles.albumSubtitle}
										id={`album-${album.id}`}
									>
										{album.title}
									</h2>
									<p className={styles.albumDescription}>
										{album.description}
									</p>
									<ul className={styles.list}>
										{songs
											.filter((song) => song.album_id === album.id)
											.map((song) => (
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
				<div className={styles.modalContent}>
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
										onChange={() =>
											togglePlaylistSelection(playlist.id)
										}
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
				</div>
			</Modal>
		</div>
	);
}

export { ArtistsList };
