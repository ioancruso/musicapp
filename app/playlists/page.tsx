import { unstable_cache } from "next/cache";
import { createClientService } from "@/utilities/supabase/supabase";
import { Playlists } from "@/components/playlists/playlists";
import { getLoggedUser } from "@/utilities/auth/auth";
import { Playlist, userId, Song } from "@/utilities/types";

import type { Metadata } from "next/types";

import styles from "./page.module.scss";

export const metadata: Metadata = {
	title: "Playlists",
};

async function fetchPlaylistsAndSongs(userId: userId): Promise<Playlist[]> {
	const supabase = createClientService();

	// Fetch playlists for the logged-in user
	const { data: playlists, error: playlistsError } = await supabase
		.from("playlists")
		.select()
		.eq("user_id", userId);

	if (playlistsError) {
		console.error("Error fetching playlists:", playlistsError);
		return [];
	}

	const playlistIds = playlists.map((playlist) => playlist.id);

	// Fetch playlist-song relationships
	const { data: playlistsSongs, error: playlistsSongsError } = await supabase
		.from("playlist_songs")
		.select()
		.in("playlist_id", playlistIds);

	if (playlistsSongsError) {
		console.error("Error fetching playlist songs:", playlistsSongsError);
		return playlists.map((playlist) => ({
			...playlist,
			songsOfPlaylist: [],
		}));
	}

	const songIds = playlistsSongs.map((playlistSong) => playlistSong.song_id);

	// Fetch song details
	const { data: songs, error: songsError } = await supabase
		.from("songs")
		.select()
		.in("id", songIds);

	if (songsError) {
		console.error("Error fetching songs:", songsError);
		return playlists.map((playlist) => ({
			...playlist,
			songsOfPlaylist: [],
		}));
	}

	// Assign song objects to each playlist
	const updatedPlaylists = playlists.map((playlist) => {
		const playlistSongs: Song[] = playlistsSongs
			.filter((playlistSong) => playlistSong.playlist_id === playlist.id)
			.map((playlistSong) =>
				songs.find((song) => song.id === playlistSong.song_id)
			) as Song[];
		return { ...playlist, songsOfPlaylist: playlistSongs };
	});

	return updatedPlaylists;
}

export default async function PlaylistsPage() {
	const userId = await getLoggedUser();

	try {
		const getCachedPlaylists = unstable_cache(
			async (userId) => await fetchPlaylistsAndSongs(userId),
			[`playlists-of-${userId}`],
			{ tags: [`playlists-${userId}`] }
		);

		const playlists = await getCachedPlaylists(userId);

		return (
			<div className={styles.playlistsContainer}>
				<h2 className={styles.playlistsTitle}>Your Playlists</h2>
				<Playlists playlists={playlists} userId={userId} />
			</div>
		);
	} catch (error) {
		console.log(error);
		return (
			<div className={styles.errorContainer}>
				<h2>Error fetching playlists</h2>
			</div>
		);
	}
}
