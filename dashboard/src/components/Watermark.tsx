import Image from "next/image";

export default function Watermark() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 opacity-40">
      <Image src="/tag-logo.png" alt="F1 Naija" width={48} height={48} className="rounded-full" />
    </div>
  );
}
