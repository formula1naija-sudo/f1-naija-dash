import Image from "next/image";

export default function Watermark() {
  return (
    {/* Tucked below ThemeToggle (which sits at bottom-16) */}
    <div className="pointer-events-none fixed bottom-3 left-3 z-40 opacity-25">
      <Image src="/tag-logo.png" alt="F1 Naija" width={48} height={48} className="rounded-full" />
    </div>
  );
}
