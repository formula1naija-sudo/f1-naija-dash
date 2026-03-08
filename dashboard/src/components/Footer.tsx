import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-800/60 pt-8 pb-6">
      <div className="flex flex-col items-center gap-5 text-center">

        {/* Brand + version */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wide text-white">F1 Naija</span>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-[11px] text-zinc-600">v{process.env.version}</span>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <a
            href="https://x.com/f1_naija"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter
          </a>
          <span className="text-zinc-800">|</span>
          <a
            href="https://www.instagram.com/f1_naija/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <span className="text-zinc-800">|</span>
          <a
            href="https://www.tiktok.com/@f1.naija"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            TikTok
          </a>
          <span className="text-zinc-800">|</span>
          <Link href="/help" className="hover:text-white transition-colors">
            Help
          </Link>
        </div>

        {/* Legal */}
        <p className="max-w-sm text-[11px] leading-relaxed text-zinc-700">
          Unofficial fan project — not affiliated with Formula One Licensing B.V., the FIA, or any F1 team.
          F1, FORMULA ONE and GRAND PRIX are trademarks of Formula One Licensing B.V.
        </p>
      </div>
    </footer>
  );
}
