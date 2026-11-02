import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
    size?: number;
    showWordmark?: boolean;
    className?: string;
};

export function Logo({ size = 32, showWordmark = true, className }: Props) {
    const gradientId = useId();

    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                role={showWordmark ? undefined : "img"}
                aria-label={showWordmark ? undefined : "MiniCRM"}
                aria-hidden={showWordmark || undefined}
                className="shrink-0 drop-shadow-sm"
            >
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="32"
                        y2="32"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0" stopColor="#6366f1" />
                        <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
                <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill={`url(#${gradientId})`}
                />
                <path
                    d="M8.5 23V9.5l7.5 8 7.5-8V23"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="16" cy="24.2" r="1.4" fill="#fff" opacity=".85" />
            </svg>
            {showWordmark && (
                <span className="text-lg font-semibold tracking-tight">
                    Mini
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        CRM
                    </span>
                </span>
            )}
        </span>
    );
}
