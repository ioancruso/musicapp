import styles from "./page.module.scss";

export default function About() {
	return (
		<div className={styles.container}>
			<h1>About This App</h1>
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
			<h2>What I Used</h2>
			<ul>
				<li>
					<strong>Next.js</strong>
				</li>
				<li>
					<strong>Supabase</strong>
				</li>
			</ul>
			<h2>Features</h2>
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
			<h2>Guidelines Followed</h2>
			<p>
				The project follows the given guidelines, ensuring a
				well-structuredw and maintainable codebase. It includes all required
				functionalities and considers related security aspects for the
				search feature.
			</p>
			<h2>Submission Details</h2>
			<p>
				You can find the code for this project in the provided GitHub
				repository. Detailed instructions on how to run the project locally
				are included in the README file. A 2-minute video demo with
				voiceover is also provided to showcase the functionalities.
			</p>
			<h2>Contact</h2>
			<p>
				If you have any questions, feel free to reach out to me at{" "}
				<a href="mailto:ionut.cruso@gmail.com">ionut.cruso@gmail.com</a>.
			</p>
		</div>
	);
}
