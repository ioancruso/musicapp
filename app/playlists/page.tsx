import { createClientService } from "@/utilities/supabase/supabase";
import { getLoggedUser } from "@/utilities/auth/auth";
import { Playlist, Song, userId } from "@/utilities/types";
import { Button } from "@/components/button/button";
import styles from "./page.module.scss";
import { SongsList } from "@/components/songlist/songlist";

async function fetchPlaylistsAndSongs(
	userId: userId
): Promise<{ playlists: Playlist[]; songs: Song[] }> {
	const supabase = createClientService();

	// Fetch playlists for the logged-in user
	const { data: playlists, error: playlistsError } = await supabase
		.from("playlists")
		.select()
		.eq("user_id", userId);

	if (playlistsError) {
		console.error("Error fetching playlists:", playlistsError);
		return { playlists: [], songs: [] };
	}

	const playlistIds = playlists.map((playlist) => playlist.id);

	// Fetch playlist-song relationships
	const { data: playlistsSongs, error: playlistsSongsError } = await supabase
		.from("playlist_songs")
		.select()
		.in("playlist_id", playlistIds);

	if (playlistsSongsError) {
		console.error("Error fetching playlist songs:", playlistsSongsError);
		return { playlists, songs: [] };
	}

	const songIds = playlistsSongs.map((playlistSong) => playlistSong.song_id);

	// Fetch song details
	const { data: songs, error: songsError } = await supabase
		.from("songs")
		.select()
		.in("id", songIds);

	if (songsError) {
		console.error("Error fetching songs:", songsError);
		return { playlists, songs: [] };
	}

	// Assign song IDs to each playlist
	const updatedPlaylists = playlists.map((playlist) => {
		const songIds = playlistsSongs
			.filter((playlistSong) => playlistSong.playlist_id === playlist.id)
			.map((playlistSong) => playlistSong.song_id);
		return { ...playlist, songs: songIds };
	});

	return { playlists: updatedPlaylists, songs };
}

export default async function PlaylistsPage() {
	const userId = await getLoggedUser();

	try {
		const { playlists, songs } = await fetchPlaylistsAndSongs(userId);

		return (
			<div className={styles.playlistsContainer}>
				<h2 className={styles.playlistsTitle}>Your Playlists</h2>
				<div className={styles.playlistsGrid}>
					{playlists.map((playlist) => (
						<div key={playlist.id} className={styles.playlist}>
							<h2
								className={styles.playlistTitle}
								id={`playlist-${playlist.id}`}
							>
								{playlist.name}
							</h2>
							<SongsList
								songs={songs.filter((song) =>
									playlist.songs.includes(song.id)
								)}
								playlists={playlists}
								userId={userId}
							/>
						</div>
					))}
				</div>
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
