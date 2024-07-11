import { unstable_cache } from "next/cache";

import { createClientService } from "@/utilities/supabase/supabase";
import { SongsList } from "@/components/songlist/songlist";

import { getLoggedUser } from "@/utilities/auth/auth";
import { Artist, Album, Song, Playlist } from "@/utilities/types";
import { Button } from "@/components/button/button";

import styles from "./page.module.scss";

async function fetchArtistsAndAlbumsAndSongs(
	artistName: string
): Promise<{ artist: Artist; albums: Album[]; songs: Song[] }> {
	const supabase = createClientService();

	const { data: artist, error: artistError } = await supabase
		.from("artists")
		.select()
		.eq("name", artistName)
		.single();

	if (artistError) {
		console.error("Error fetching artist:", artistError);
		throw new Error("The artist doesn't exist");
	}

	const { data: albums, error: albumsError } = await supabase
		.from("albums")
		.select()
		.eq("artist_id", artist?.id);

	if (albumsError) {
		console.error("Error fetching albums:", albumsError);
		return { artist, albums: [], songs: [] };
	}

	const albumIds = albums.map((album) => album.id);
	const { data: songs, error: songsError } = await supabase
		.from("songs")
		.select()
		.in("album_id", albumIds);

	if (songsError) {
		console.error("Error fetching songs:", songsError);
		return { artist, albums, songs: [] };
	}

	return { artist, albums, songs };
}

async function fetchUserPlaylistsWithSongs(
	userId: string
): Promise<Playlist[]> {
	const supabase = createClientService();

	const { data: playlists, error: playlistsError } = await supabase
		.from("playlists")
		.select()
		.eq("user_id", userId);

	if (playlistsError) {
		console.error("Error fetching playlists:", playlistsError);
		return [];
	}

	const playlistIds = playlists.map((playlist) => playlist.id);
	const { data: playlistsSongs, error: playlistsSongsError } = await supabase
		.from("playlist_songs")
		.select()
		.in("playlist_id", playlistIds);

	if (playlistsSongsError) {
		console.error("Error fetching playlist songs:", playlistsSongsError);
		return playlists.map((playlist) => ({ ...playlist, songs: [] }));
	}

	const songIds = playlistsSongs.map((playlistSong) => playlistSong.song_id);
	const { data: songs, error: songsError } = await supabase
		.from("songs")
		.select()
		.in("id", songIds);

	if (songsError) {
		console.error("Error fetching songs:", songsError);
		return playlists.map((playlist) => ({ ...playlist, songs: [] }));
	}

	const playlistsWithSongs = playlists.map((playlist) => {
		const songsOfPlaylist = playlistsSongs
			.filter((playlistSong) => playlistSong.playlist_id === playlist.id)
			.map((playlistSong) =>
				songs.find((song) => song.id === playlistSong.song_id)
			);
		return { ...playlist, songsOfPlaylist: songsOfPlaylist };
	});

	return playlistsWithSongs;
}

export default async function ArtistPage({
	params,
}: {
	params: { artist: string };
}) {
	const userId = await getLoggedUser();

	const selectedArtistTitle = decodeURIComponent(params.artist);

	try {
		const { artist, albums, songs } = await fetchArtistsAndAlbumsAndSongs(
			selectedArtistTitle
		);

		let playlists: Playlist[] = [];
		if (userId) {
			const getCachedPlaylists = unstable_cache(
				async (userId) => await fetchUserPlaylistsWithSongs(userId),
				[`playlists-${userId}`],
				{ tags: [`playlists-${userId}`] }
			);

			playlists = await getCachedPlaylists(userId);
		}

		return (
			<>
				<div className={styles.selectedArtistContainer}>
					<h2 className={styles.artistTitle}>
						Albums of {selectedArtistTitle}
					</h2>
					<Button text="Back" type="link" href="/artists" />
					<div className={styles.albumsGridContainer}>
						{albums.map((album) => (
							<div
								key={album.id}
								className={styles.album}
								id={`album-${album.id}`}
							>
								<div className={styles.albumImageContainer}>
									<img
										src={album.thumbnail}
										alt={`${album.title} thumbnail`}
										className={styles.image}
									/>
								</div>
								<h2 className={styles.albumSubtitle}>{album.title}</h2>
								<p className={styles.albumDescription}>
									{album.description}
								</p>
								<SongsList
									songs={songs.filter(
										(song) => song.album_id === album.id
									)}
									playlists={playlists}
									userId={userId}
								/>
							</div>
						))}
					</div>
				</div>
			</>
		);
	} catch (error) {
		console.log(error);
		return (
			<>
				<div className={styles.selectedArtistContainer}>
					<h2>The artist selected doesn't exist</h2>
				</div>
			</>
		);
	}
}
