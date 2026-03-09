import clsx from "clsx";

type Props = {
	on: boolean;
	possible: boolean;
	inPit: boolean;
	pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
	const pit = inPit || pitOut;

	return (
		<span
			className={clsx(
				"text-md inline-flex h-8 w-full items-center justify-center rounded-md border-2 font-mono font-black",
				{
					"border-zinc-700 text-zinc-700": !pit && !on && !possible,
					"border-naija-gold/70 text-naija-gold/70": !pit && !on && possible,
					"border-naija-green text-naija-green": !pit && on,
					"border-naija-gold text-naija-gold": pit,
				},
			)}
		>
			{pit ? "PIT" : "DRS"}
		</span>
	);
}
