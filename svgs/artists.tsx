import { SVGProps } from "react";

function ArtistsSvg(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="var(--text-color)"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M7 9v6m14-1V7.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 4 18.92 4 17.8 4H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 5.52 3 6.08 3 7.2v9.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 20 5.08 20 6.2 20H12m0-7h.798c.445 0 .667 0 .879.046.187.041.368.11.536.202.19.104.357.25.692.544l5.96 5.215a1.411 1.411 0 1 1-1.858 2.124l-5.914-5.175c-.402-.352-.603-.528-.748-.74a2 2 0 0 1-.28-.618C12 14.35 12 14.082 12 13.548V13Z"
			/>
		</svg>
	);
}

export { ArtistsSvg };
