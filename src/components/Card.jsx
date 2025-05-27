import { cn } from "@/lib/utils";

export default function Card({ className = '', ...props }) {
    return (
      <div
        data-slot="card"
        className={cn(
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
            "bg-[#17191d] overflow-hidden hover:bg-[#252525] transition-colors rounded-[5px] p-4",
            props.onClick && "cursor-pointer",
            className
        )}
        {...props}
     />
  );
}
