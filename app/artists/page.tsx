import Link from "next/link";

import { createClientService } from "@/utilities/supabase/supabase";

import type { Artist } from "@/utilities/types";

import { Metadata } from "next/types";

import styles from "./page.module.scss";

export const metadata: Metadata = {
	title: "Artists",
};

async function fetchArtistsAndAlbumsAndSongs(): Promise<Artist[]> {
	const supabase = createClientService();

	const { data: artists, error: artistsError } = await supabase
		.from("artists")
		.select();
	if (artistsError) {
		console.error("Error fetching artists:", artistsError);
		return [];
	}

	return artists;
}

export default async function ArtistsPage() {
	const artists: Artist[] = await fetchArtistsAndAlbumsAndSongs();

	return (
		<div className={styles.gridContainer}>
			{artists.map((artist) => (
				<Link
					key={artist.id}
					className={styles.artist}
					href={`/artists/${encodeURIComponent(artist.name)}`}
					id={`artist-${artist.id}`}
				>
					<div className={styles.imageContainer}>
						<img
							src={artist.thumbnail}
							alt={`${artist.name} thumbnail`}
							className={styles.image}
						/>
					</div>
					<h2 className={styles.subtitle}>{artist.name}</h2>
				</Link>
			))}
		</div>
	);
}
