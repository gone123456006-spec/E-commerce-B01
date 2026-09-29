import tealMark from "@/assets/logo-mark-teal.png";
import whiteMark from "@/assets/logo-mark-white.png";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "lg";
  /** The artwork is flat colour, so the mark is picked to suit the surface. */
  tone?: "teal" | "white";
};

/** The Chowly mark and name, from the same artwork the mobile app ships. */
export function Wordmark({ className, size = "sm", tone = "teal" }: Props) {
  const large = size === "lg";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        alt=""
        className={cn(large ? "size-14" : "size-9", "shrink-0 object-contain")}
        src={tone === "white" ? whiteMark : tealMark}
      />

      <span className={cn("font-semibold tracking-tight", large ? "text-4xl" : "text-xl")}>
        Chowly
      </span>
    </div>
  );
}
