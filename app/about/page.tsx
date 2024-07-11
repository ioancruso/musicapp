import type { Metadata } from "next/types";

import styles from "./page.module.scss";

export const metadata: Metadata = {
	title: "About",
};

export default function About() {
	return (
		<div className={styles.container}>
			<h2>
				Demo URL: <a href="https://music.icruso.ro">CLICK</a>
			</h2>
			<div className={styles.separator}></div>
			<h2>
				GitHub Repository:{" "}
				<a href="https://github.com/ioancruso/musicapp">CLICK</a>
			</h2>
			<div className={styles.separator}></div>
			<h2>1. About This App</h2>
			<p>
				Welcome to the Digital Music Library! This application is designed
				as part of an assignment for the Grad/Junior Full Stack Engineer
				position at Marsh McLennan. The primary goal of this project is to
				visualize artists and their albums, allowing users to open albums to
				view a description and a list of songs and even to create playlists.
				Additionally, the app features a search functionality with an
				autocomplete component to provide suggestions as users type in the
				search box.
			</p>
			<h2>2. What I Used</h2>
			<ul>
				<li>
					<strong>Next.js</strong> - A React framework for server-side
					rendering and static site generation.
				</li>
				<li>
					<strong>Supabase</strong> - An open-source Firebase alternative
					for authentication, database, and storage.
				</li>
				<li>
					<strong>React</strong> - A JavaScript library for building user
					interfaces.
				</li>
				<li>
					<strong>TypeScript</strong> - A typed superset of JavaScript that
					compiles to plain JavaScript.
				</li>
				<li>
					<strong>SCSS</strong> - A CSS preprocessor that adds power and
					elegance to the basic language.
				</li>
				<li>
					<strong>Framer Motion</strong> - A library for animations and
					gestures in React.
				</li>
			</ul>
			<h2>3. Features</h2>
			<ul>
				<li>List all artists and their albums</li>
				<li>List all the albums</li>
				<li>
					View detailed information about each album, including a list of
					songs
				</li>
				<li>A playlist section where you can create your own playlists</li>
				<li>Search functionality with autocomplete</li>
				<li>User authentication</li>
				<li>Responsive design</li>
			</ul>
			<h2>4. Guidelines Followed</h2>
			<p>
				The project follows the given guidelines, ensuring a well-structured
				and maintainable codebase. It includes all required functionalities
				and considers related security aspects for the search feature.
			</p>
			<h2>5. Getting Started</h2>
			<p>
				For detailed installation instructions, please refer to the{" "}
				<a href="https://github.com/ioancruso/musicapp">GitHub README</a>.
			</p>
			<h2>6. Contact</h2>
			<p>
				If you have any questions, feel free to reach out to me at{" "}
				<a href="mailto:ionut.cruso@gmail.com">ionut.cruso@gmail.com</a>.
			</p>
		</div>
	);
}
