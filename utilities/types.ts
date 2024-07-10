export type themeType = "light" | "dark";
export type userId = string | null;

export type Song = {
	id: string;
	album_id: string;
	title: string;
	length: string;
};

export type Album = {
	id: string;
	artist_id: string;
	title: string;
	description: string;
	thumbnail: string;
};

export type Artist = {
	id: string;
	name: string;
	thumbnail: string;
};

export type Playlist = {
	id: string;
	name: string;
	user_id: string;
	songs: Song["id"][];
};

type SearchResult = {
	type: "artist" | "album" | "song";
	data: Artist | Album | Song;
};
