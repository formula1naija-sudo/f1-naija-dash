import Link from "next/link";

export default function Footer() {
    return (
        <footer className="my-8 text-sm text-zinc-500">
            <div className="mb-4 flex flex-wrap gap-2">
                <p>
                    Powered by <TextLink website="https://x.com/f1_naija">F1 Naija</TextLink>.
                </p>

                <p>
                    Follow us on <TextLink website="https://x.com/f1_naija">X (Twitter)</TextLink>.
                </p>

                <p>
                    Follow us on <TextLink website="https://www.instagram.com/f1_naija/">Instagram</TextLink>.
                </p>

                <p>
                    Follow us on <TextLink website="https://www.tiktok.com/@f1.naija">TikTok</TextLink>.
                </p>

                <p>
                    Get{" "}
                    <Link className="text-blue-500" href="/help">
                        Help
                    </Link>
                    .
                </p>

                <p>Version: {process.env.version}</p>
            </div>

            <p>
                This project/website is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA
                ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trademarks of Formula One
                Licensing B.V.
            </p>
        </footer>
    );
}

type TextLinkProps = {
    website: string;
    children: string;
};

const TextLink = ({ website, children }: TextLinkProps) => {
    return (
        <a className="text-blue-500" target="_blank" href={website}>
            {children}
        </a>
    );
};
