"use server";

import { createClientService } from "@/utilities/supabase/supabase";
import { userId, Artist, Album, Song, Playlist } from "@/utilities/types";
import { revalidateTag } from "next/cache";

const supabase = createClientService();

export interface SearchResult {
	type: "artist" | "album" | "song";
	data: Artist | Album | Song;
}

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
	} else {
		revalidateTag(`playlists-${userId}`);
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
	} else {
		revalidateTag(`playlists-${userId}`);
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
	} else {
		revalidateTag(`playlists-${userId}`);
	}

	return data;
}

export async function searchSuggestions(
	query: string
): Promise<SearchResult[]> {
	const artistResponse = await supabase
		.from("artists")
		.select("*")
		.ilike("name", `%${query}%`);

	const albumResponse = await supabase
		.from("albums")
		.select("*")
		.ilike("title", `%${query}%`);

	const songResponse = await supabase
		.from("songs")
		.select("*")
		.ilike("title", `%${query}%`);

	const results: SearchResult[] = [];

	if (artistResponse.data) {
		artistResponse.data.forEach((artist) =>
			results.push({ type: "artist", data: artist })
		);
	}
	if (albumResponse.data) {
		albumResponse.data.forEach((album) =>
			results.push({ type: "album", data: album })
		);
	}
	if (songResponse.data) {
		songResponse.data.forEach((song) =>
			results.push({ type: "song", data: song })
		);
	}

	return results;
}
