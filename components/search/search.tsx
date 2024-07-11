"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Artist, Album, Song, SearchResult } from "@/utilities/types";
import { fetchSuggestions } from "@/utilities/serverActions";
import styles from "./search.module.scss";

function Search() {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const router = useRouter();

	const containerRef = useRef<HTMLDivElement>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	function onChange(event: React.ChangeEvent<HTMLInputElement>) {
		setQuery(event.target.value);
	}

	useEffect(() => {
		if (query.length < 2) {
			setSuggestions([]);
			setLoading(false);
			return;
		}

		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		debounceTimeoutRef.current = setTimeout(() => {
			getData();
		}, 1000);

		setLoading(true);
	}, [query]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent): void {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setQuery("");
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	async function getData() {
		const { data, error } = await fetchSuggestions(query);

		if (error) {
			setError(error);
			setSuggestions([]);
		} else {
			setError(null);
			setSuggestions(data);
		}

		setLoading(false);
		setShowSuggestions(true);
	}

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
				onChange={onChange}
				placeholder="Search for artists, albums, or songs..."
				className={styles.input}
			/>
			{showSuggestions && query.length >= 2 && (
				<ul className={styles.suggestionsList}>
					{error ? (
						<li className={styles.error}>{error}</li>
					) : loading ? (
						<li className={styles.noResults}>Loading...</li>
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
