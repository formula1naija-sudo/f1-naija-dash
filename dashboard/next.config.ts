import type { NextConfig } from "next";

import pack from "./package.json" with { type: "json" };

import "@/env";

const output = process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined;
const compress = process.env.NEXT_NO_COMPRESS === "1";

const frameDisableHeaders = [
	{
		source: "/(.*)",
		headers: [
			{
				type: "header",
				key: "X-Frame-Options",
				value: "SAMEORIGIN",
			},
			{
				type: "header",
				key: "Content-Security-Policy",
				value: "frame-ancestors 'self';",
			},
		],
	},
];

const config: NextConfig = {
	output,
	compress,
	env: {
		version: pack.version,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**formula1.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "pbs.twimg.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "**.twimg.com",
				port: "",
			},
		],
	},
	headers: async () => frameDisableHeaders,
	async rewrites() {
		return [
			{
				source: "/api/realtime",
				destination: "https://rt-api.f1-dash.com/api/realtime",
			},
		];
	},
	async redirects() {
		return [
			// Pages absorbed into Community
			{ source: "/start-here",  destination: "/community", permanent: true },
			{ source: "/naija-index", destination: "/community", permanent: true },
			{ source: "/fantasy",     destination: "/community", permanent: true },
			{ source: "/help",        destination: "/community", permanent: true },
			// Standalone data pages → closest nav equivalent
			{ source: "/results",     destination: "/standings", permanent: true },
			{ source: "/drivers",     destination: "/community", permanent: true },
		];
	},
};

export default config;
