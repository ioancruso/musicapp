"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { signOut } from "@/utilities/auth/auth";
import { themeType, userId } from "@/utilities/types";
import { ThemeSwitcher } from "../themeswitcher/themeswitcher";

import { PlaylistSvg } from "@/svgs/playlist";
import { ArtistsSvg } from "@/svgs/artists";
import { HomeSvg } from "@/svgs/home";
import { MenuSvg } from "@/svgs/menu";
import { AboutSvg } from "@/svgs/about";

import styles from "./navigation.module.scss";

interface NavigationProps {
	userId: userId;
	theme: themeType;
}

function Navigation({ userId, theme }: NavigationProps) {
	const [showNav, setShowNav] = useState<boolean>(false);

	const router = useRouter();
	const pathname = usePathname();

	function toggleNav() {
		setShowNav(!showNav);
	}

	async function handleSignOut() {
		try {
			await signOut();
			setShowNav(false);
			router.refresh();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	}

	useEffect(() => {
		function handleResize() {
			setShowNav(false);
		}

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		function preventScroll(e: Event) {
			e.preventDefault();
		}

		if (showNav) {
			window.addEventListener("touchmove", preventScroll, {
				passive: false,
			});
			window.addEventListener("wheel", preventScroll, { passive: false });
		} else {
			window.removeEventListener("touchmove", preventScroll);
			window.removeEventListener("wheel", preventScroll);
		}

		return () => {
			window.removeEventListener("touchmove", preventScroll);
			window.removeEventListener("wheel", preventScroll);
		};
	}, [showNav]);

	useEffect(() => {
		router.refresh();
	}, [userId]);

	return (
		<aside className={styles.navigationWrapper}>
			<div className={styles.navHeader}>
				<nav className={styles.navMenu}>
					<ul>
						<li>
							<Link
								href="/"
								className={pathname === "/" ? styles.activeLink : ""}
							>
								<HomeSvg width={23} height={23} />
								Home
							</Link>
						</li>
						<li>
							<Link
								href="/about"
								className={
									pathname === "/about" ? styles.activeLink : ""
								}
							>
								<AboutSvg width={23} height={23} />
								About
							</Link>
						</li>
						<li>
							<Link
								href="/artists"
								className={
									pathname === "/artists" ? styles.activeLink : ""
								}
							>
								<ArtistsSvg width={23} height={23} />
								Artists
							</Link>
						</li>
						{userId && (
							<li>
								<Link
									href="/playlists"
									className={
										pathname === "/playlists" ? styles.activeLink : ""
									}
								>
									<PlaylistSvg width={23} height={23} />
									Playlists
								</Link>
							</li>
						)}
					</ul>
					{!userId ? (
						<div className={styles.auth}>
							<button
								onClick={() => {
									router.push("?auth=login");
									toggleNav();
								}}
							>
								Login
							</button>
							<button
								onClick={() => {
									router.push("?auth=register");
									toggleNav();
								}}
							>
								Register
							</button>
						</div>
					) : (
						<div className={styles.disconnect}>
							<button
								onClick={() => {
									handleSignOut();
									toggleNav();
								}}
							>
								Disconnect
							</button>
						</div>
					)}
				</nav>
				<ThemeSwitcher theme={theme} />
				<motion.div
					className={styles.menu}
					onClick={toggleNav}
					animate={{ rotate: showNav ? 90 : 0 }}
					transition={{ delay: showNav ? 0 : 0.2 }}
				>
					<MenuSvg />
					Menu
				</motion.div>
			</div>
			<motion.div
				className={styles.mobileMenu}
				initial={{ x: "-100vw" }}
				animate={{ x: showNav ? "0vw" : "-100vw" }}
				transition={{ duration: 0.4, ease: "easeInOut" }}
			>
				<div className={styles.closeNav}>
					<button onClick={toggleNav}>X</button>
				</div>
				<nav>
					<ul>
						<li>
							<Link
								onClick={toggleNav}
								href="/"
								className={pathname === "/" ? styles.activeLink : ""}
							>
								<HomeSvg width={23} height={23} />
								Home
							</Link>
						</li>
						<li>
							<Link
								onClick={toggleNav}
								href="/about"
								className={
									pathname === "/about" ? styles.activeLink : ""
								}
							>
								<AboutSvg width={23} height={23} />
								About
							</Link>
						</li>
						<li>
							<Link
								onClick={toggleNav}
								href="/artists"
								className={
									pathname === "/artists" ? styles.activeLink : ""
								}
							>
								<ArtistsSvg width={23} height={23} />
								Artists
							</Link>
						</li>
						{userId && (
							<li>
								<Link
									onClick={toggleNav}
									href="/playlists"
									className={
										pathname === "/playlists" ? styles.activeLink : ""
									}
								>
									<PlaylistSvg width={23} height={23} />
									Playlists
								</Link>
							</li>
						)}
					</ul>
					{!userId ? (
						<div className={styles.auth}>
							<button
								onClick={() => {
									router.push("?auth=login");
									toggleNav();
								}}
							>
								Login
							</button>
							<button
								onClick={() => {
									router.push("?auth=register");
									toggleNav();
								}}
							>
								Register
							</button>
						</div>
					) : (
						<div className={styles.disconnect}>
							<button
								onClick={() => {
									handleSignOut();
									toggleNav();
								}}
							>
								Disconnect
							</button>
						</div>
					)}
				</nav>
			</motion.div>
		</aside>
	);
}

export { Navigation };
