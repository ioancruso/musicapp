"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { Artist, Album, Song } from "@/utilities/types";

import styles from "./search.module.scss";

interface SearchResult {
	type: "artist" | "album" | "song";
	data: Artist | Album | Song;
}

interface SearchProps {
	fetchSuggestions: (query: string) => Promise<SearchResult[]>;
}

function Search({ fetchSuggestions }: SearchProps) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const router = useRouter();

	useEffect(() => {
		async function fetchData() {
			if (query.length >= 2) {
				const data = await fetchSuggestions(query);
				setSuggestions(data);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(query.length > 0);
			}
		}
		fetchData();
	}, [query, fetchSuggestions]);

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

	function handleSelect(result: SearchResult) {
		const router = useRouter();
		const artistName = encodeURIComponent((result.data as Artist).name);
		router.push(`/artists/${artistName}`);
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
					{query.length < 2 ? (
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
