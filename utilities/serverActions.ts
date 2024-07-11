"use server";

import { createClientService } from "@/utilities/supabase/supabase";
import { userId, Playlist } from "@/utilities/types";
import { revalidateTag } from "next/cache";

const supabase = createClientService();

export async function addSongToPlaylists(
	userId: userId,
	songId: string,
	playlistIds: string[]
): Promise<{ error: string | null }> {
	const { data: existingSongs, error: fetchError } = await supabase
		.from("playlist_songs")
		.select("song_id, playlist_id")
		.in("playlist_id", playlistIds)
		.eq("song_id", songId);

	if (fetchError) {
		console.error("Error fetching existing songs in playlists:", fetchError);
		return { error: "Failed to fetch existing songs in playlists" };
	}

	const existingPlaylistIds = new Set(
		existingSongs.map((entry: { playlist_id: string }) => entry.playlist_id)
	);
	const newPlaylistIds = playlistIds.filter(
		(playlistId) => !existingPlaylistIds.has(playlistId)
	);

	if (newPlaylistIds.length === 0) {
		return { error: "Song already exists in the selected playlists" };
	}

	const { error: insertError } = await supabase.from("playlist_songs").insert(
		newPlaylistIds.map((playlistId) => ({
			user_id: userId,
			song_id: songId,
			playlist_id: playlistId,
		}))
	);

	if (insertError) {
		console.error("Error adding song to playlists:", insertError);
		return { error: "Failed to add song to playlists" };
	}

	revalidateTag(`playlists-${userId}`);
	return { error: null };
}

export async function removeSongFromPlaylists(
	userId: userId,
	songId: string,
	playlistIds: string[]
): Promise<{ error: string | null }> {
	const { error } = await supabase
		.from("playlist_songs")
		.delete()
		.eq("user_id", userId)
		.in("playlist_id", playlistIds)
		.eq("song_id", songId);
	if (error) {
		console.error("Error removing song from playlists:", error);
		return { error: "Failed to remove song from playlists" };
	} else {
		revalidateTag(`playlists-${userId}`);
		return { error: null };
	}
}

export async function removeSongsFromPlaylist(
	userId: userId,
	songIds: string[],
	playlistId: string
): Promise<{ error: string | null }> {
	try {
		// Delete the songs from the playlist in the database
		const { error } = await supabase
			.from("playlist_songs")
			.delete()
			.eq("user_id", userId)
			.eq("playlist_id", playlistId)
			.in("song_id", songIds);

		// Check for errors in the deletion process
		if (error) {
			console.error("Error removing songs from playlist:", error);
			return { error: "Failed to remove songs from playlist" };
		} else {
			revalidateTag(`playlists-${userId}`);
			return { error: null };
		}
	} catch (err) {
		console.error("Unexpected error removing songs from playlist:", err);
		return { error: "Unexpected error occurred" };
	}
}

export async function createPlaylist(
	userId: userId,
	name: string
): Promise<{ data: Playlist | null; error: string | null }> {
	const { data, error } = await supabase
		.from("playlists")
		.insert({ user_id: userId, name })
		.select()
		.single();

	if (error) {
		console.error("Error creating playlist:", error);
		return { data: null, error: "Failed to create playlist" };
	} else {
		revalidateTag(`playlists-${userId}`);
		return { data, error: null };
	}
}

export async function updatePlaylistName(
	userId: userId,
	playlistId: string,
	newName: string
): Promise<{ error: string | null }> {
	const { error } = await supabase
		.from("playlists")
		.update({ name: newName })
		.eq("id", playlistId)
		.eq("user_id", userId);

	if (error) {
		console.error("Error updating playlist name:", error);
		return { error: "Failed to update playlist name" };
	} else {
		revalidateTag(`playlists-${userId}`);
		return { error: null };
	}
}

export async function deletePlaylist(
	userId: userId,
	playlistId: string
): Promise<{ error: string | null }> {
	const { error: playlistSongsError } = await supabase
		.from("playlist_songs")
		.delete()
		.eq("playlist_id", playlistId);

	if (playlistSongsError) {
		console.error("Error deleting songs from playlist:", playlistSongsError);
		return { error: "Failed to delete songs from playlist" };
	}

	const { error: playlistError } = await supabase
		.from("playlists")
		.delete()
		.eq("id", playlistId)
		.eq("user_id", userId);

	if (playlistError) {
		console.error("Error deleting playlist:", playlistError);
		return { error: "Failed to delete playlist" };
	} else {
		revalidateTag(`playlists-${userId}`);
		return { error: null };
	}
}
