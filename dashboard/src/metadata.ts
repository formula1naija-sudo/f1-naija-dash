import type { Metadata } from "next";

const title = "F1 Naija | Live F1 Dashboard";
const description =
	"Real-time Formula 1 timing and telemetry. Live leaderboards, tire choices, gaps, lap times, sector times and more. Powered by F1 Naija.";

const url = "https://f1-naija-dash.vercel.app";

export const metadata: Metadata = {
	generator: "Next.js",

	applicationName: title,

	title,
	description,

	icons: "/favicon.png",

	openGraph: {
		title,
		description,
		url,
		type: "website",
		siteName: "F1 Naija Live Dashboard",
		images: [
			{
				alt: "F1 Naija Live Dashboard",
				url: `${url}/tag-logo.png`,
				width: 400,
				height: 400,
			},
		],
	},

	twitter: {
		site: "@f1naija",
		title,
		description,
		creator: "@f1naija",
		card: "summary_large_image",
		images: [
			{
				url: `${url}/tag-logo.png`,
				alt: "F1 Naija Live Dashboard",
				width: 400,
				height: 400,
			},
		],
	},

	category: "Sports & Recreation",

	referrer: "strict-origin-when-cross-origin",

	keywords: ["Formula 1", "f1 dashboard", "realtime telemetry", "f1 timing", "live updates", "F1 Naija", "Nigeria", "F1 Africa"],

	creator: "F1 Naija",
	publisher: "F1 Naija",
	authors: [{ name: "F1 Naija", url: "https://x.com/f1naija" }],

	appleWebApp: {
		capable: true,
		title: "F1 Naija",
		statusBarStyle: "black-translucent",
	},

	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},

	metadataBase: new URL(url),

	alternates: {
		canonical: url,
	},

	manifest: "/manifest.json",
};
