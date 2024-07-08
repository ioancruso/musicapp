import { SVGProps } from "react";

export function AlbumsSvg(props: SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
			<rect
				width={384}
				height={256}
				x={64}
				y={176}
				rx={28.87}
				ry={28.87}
				fill="none"
				stroke="var(--text-color)"
				strokeLinejoin="round"
				strokeWidth={32}
			/>
			<path
				d="M144 80h224M112 128h288"
				stroke="var(--text-color)"
				strokeLinecap="round"
				strokeMiterlimit={10}
				strokeWidth={32}
			/>
		</svg>
	);
}
