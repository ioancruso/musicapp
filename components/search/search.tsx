"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Artist, Album, Song, SearchResult } from "@/utilities/types";
import { fetchSuggestions } from "@/utilities/serverActions";
import styles from "./search.module.scss";

function Search() {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const searchParams = useSearchParams();

	async function handleFetchSuggestions(query: string) {
		if (query.length >= 2) {
			const { data, error } = await fetchSuggestions(query);
			if (error) {
				setError(error);
				setSuggestions([]);
			} else {
				setError(null);
				setSuggestions(data);
			}
			setShowSuggestions(true);
		} else {
			setError(null);
			setSuggestions([]);
			setShowSuggestions(query.length > 0);
		}
	}

	useEffect(() => {
		handleFetchSuggestions(query);
	}, [query]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setQuery("");
			}
		}

		function handleResize() {
			setShowSuggestions(false);
			setQuery("");
		}

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("resize", handleResize);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if (hash) {
				const element = document.getElementById(hash.substring(1));
				if (element) {
					element.scrollIntoView({ behavior: "smooth" });
					// After scrolling, remove the hash and search parameters
					setTimeout(() => {
						const url = new URL(window.location.href);
						url.hash = "";
						url.search = "";
						history.replaceState(null, "", url.toString());
					}, 1000); // delay to allow the scroll to complete
				}
			}
		};

		// Listen for hash changes
		window.addEventListener("hashchange", handleHashChange);

		// Scroll to the element if there's a hash in the initial URL
		handleHashChange();

		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	function handleSelect(result: SearchResult) {
		setShowSuggestions(false); // Hide the suggestions dropdown
		setQuery(""); // Clear the query

		const artistName = encodeURIComponent(
			(result.data as any).artist_name || (result.data as Artist).name
		);

		let sectionId = "";
		if (result.type === "artist") {
			sectionId = `artist-${(result.data as Artist).id}`;
			router.push(`/artists#${sectionId}`);
		} else if (result.type === "album") {
			sectionId = `album-${(result.data as Album).id}`;
			router.push(`/artists/${artistName}#${sectionId}`);
		} else if (result.type === "song") {
			sectionId = `song-${(result.data as Song).id}`;
			router.push(`/artists/${artistName}#${sectionId}`);
		}
	}

	function getHighlightedText(text: string, highlight: string) {
		const parts = text.split(new RegExp(`(${highlight})`, "gi"));
		return (
			<span>
				{parts.map((part, index) =>
					part.toLowerCase() === highlight.toLowerCase() ? (
						<span key={index} className={styles.highlight}>
							{part}
						</span>
					) : (
						part
					)
				)}
			</span>
		);
	}

	return (
		<div className={styles.search} ref={containerRef}>
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search for artists, albums, or songs..."
				className={styles.input}
			/>
			{showSuggestions && (
				<ul className={styles.suggestionsList}>
					{error ? (
						<li className={styles.error}>{error}</li>
					) : query.length < 2 ? (
						<li className={styles.noResults}>
							Type at least 2 characters
						</li>
					) : suggestions.length === 0 ? (
						<li className={styles.noResults}>No results</li>
					) : (
						suggestions.map((result, index) => (
							<li
								key={index}
								onClick={() => handleSelect(result)}
								className={styles.suggestionItem}
							>
								{result.type === "artist" && (
									<div>
										Artist:{" "}
										{getHighlightedText(
											(result.data as Artist).name,
											query
										)}
									</div>
								)}
								{result.type === "album" && (
									<div>
										Album:{" "}
										{getHighlightedText(
											(result.data as Album).title,
											query
										)}
									</div>
								)}
								{result.type === "song" && (
									<div>
										Song:{" "}
										{getHighlightedText(
											(result.data as Song).title,
											query
										)}
									</div>
								)}
							</li>
						))
					)}
				</ul>
			)}
		</div>
	);
}

export { Search };
