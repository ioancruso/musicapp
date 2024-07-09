import { createClientService } from "@/utilities/supabase/supabase";
import { ArtistsList } from "@/components/artistslist/artistslist";
import styles from "./page.module.scss";
import { getLoggedUser } from "@/utilities/auth/auth";
import { userId } from "@/utilities/types";

async function fetchArtistsAndAlbumsAndSongs(userId: userId) {
	const supabase = createClientService();

	const { data: artists, error: artistsError } = await supabase
		.from("artists")
		.select();
	if (artistsError) {
		console.error("Error fetching artists:", artistsError);
		return { artists: [], albums: [], songs: [] };
	}

	const { data: albums, error: albumsError } = await supabase
		.from("albums")
		.select();
	if (albumsError) {
		console.error("Error fetching albums:", albumsError);
		return { artists, albums: [], songs: [] };
	}

	const { data: songs, error: songsError } = await supabase
		.from("songs")
		.select();
	if (songsError) {
		console.error("Error fetching songs:", songsError);
		return { artists, albums, songs: [] };
	}

	return { artists, albums, songs };
}

export default async function ArtistsPage() {
	const userId = await getLoggedUser();

	const { artists, albums, songs } = await fetchArtistsAndAlbumsAndSongs(
		userId
	);

	return (
		<div className={styles.container}>
			<ArtistsList
				artists={artists}
				albums={albums}
				songs={songs}
				userId={userId}
			/>
		</div>
	);
}
