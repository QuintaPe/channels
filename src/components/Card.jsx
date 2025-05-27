import { cn } from "@/lib/utils";

export default function Card({ className = '', ...props }) {
    return (
      <div
        data-slot="card"
        className={cn(
            "bg-gradient-to-br from-card via-[#1a1d23] to-card text-card-foreground flex flex-col gap-6 border border-ring/30 rounded-sm py-6 shadow-sm",
            "overflow-hidden hover:bg-[#252525] transition-colors p-4 ",
            props.onClick && "cursor-pointer",
            className
        )}
        {...props}
     />
  );
}
