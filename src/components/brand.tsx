import Link from "next/link";
import { Icon } from "./icons";

export function Logo({ href = "/", size = "md" }: { href?: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-11" : "size-9";
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-semibold tracking-tight" aria-label="Randevum ana sayfa">
      <span className={`grid ${box} place-items-center rounded-[11px] bg-brand text-brand-fg shadow-sm`}>
        <Icon name="calendar" size={size === "lg" ? 22 : 19} />
      </span>
      <span className={size === "lg" ? "text-xl" : "text-[17px]"}>Randevum</span>
    </Link>
  );
}
