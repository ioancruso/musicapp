"use server";

import { createClientService } from "@/utilities/supabase/supabase";
import { userId, Playlist } from "@/utilities/types";

const supabase = createClientService();

export async function addSongToPlaylists(
	userId: userId,
	songId: string,
	playlistIds: string[]
) {
	const { error } = await supabase.from("playlist_songs").insert(
		playlistIds.map((playlistId) => ({
			user_id: userId,
			song_id: songId,
			playlist_id: playlistId,
		}))
	);

	if (error) {
		console.error("Error adding song to playlists:", error);
	}
}

export async function removeSongFromPlaylists(
	userId: userId,
	songId: string,
	playlistIds: string[]
) {
	const { error } = await supabase
		.from("playlist_songs")
		.delete()
		.in("playlist_id", playlistIds)
		.eq("song_id", songId)
		.eq("user_id", userId);

	if (error) {
		console.error("Error removing song from playlists:", error);
	}
}

export async function createPlaylist(
	userId: userId,
	name: string
): Promise<Playlist | null> {
	const { data, error } = await supabase
		.from("playlists")
		.insert({ user_id: userId, name })
		.select()
		.single();

	if (error) {
		console.error("Error creating playlist:", error);
		return null;
	}

	return data;
}

export async function fetchPlaylists(userId: userId): Promise<Playlist[]> {
	const { data, error } = await supabase
		.from("playlists")
		.select("id, name, user_id")
		.eq("user_id", userId);

	if (error) {
		console.error("Error fetching playlists:", error);
		return [];
	}

	return data as Playlist[];
}

export async function fetchSongPlaylists(
	userId: userId,
	songId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from("playlist_songs")
		.select("playlist_id")
		.eq("user_id", userId)
		.eq("song_id", songId);

	if (error) {
		console.error("Error fetching song playlists:", error);
		return [];
	}

	return data.map((item: { playlist_id: string }) => item.playlist_id);
}