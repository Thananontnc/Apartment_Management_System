"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";

export default function BackButton({ label = "Back", href }: { label?: React.ReactNode, href?: string }) {
    const router = useRouter();
    const { t } = useI18n();

    let displayLabel = label;
    if (typeof label === 'string') {
        const labelKeyMap: Record<string, string> = {
            "Back to Dashboard": "back_to_dashboard",
            "Back to Properties": "back_to_properties",
            "Back to Selection": "back_to_selection",
            "Back": "back",
            "Executive Dashboard": "back_to_dashboard", // Added missing mapping
            "Portfolio Overview": "back_to_properties", // Added missing mapping
            "Asset Selection": "back_to_assets" // Added missing mapping
        };
        displayLabel = labelKeyMap[label] ? t(labelKeyMap[label]) : label;
    }

    if (href) {
        return (
            <Link
                href={href}
                className="btn"
                style={{
                    background: "transparent",
                    color: "var(--text-muted)",
                    padding: "8px 0",
                    fontSize: "0.9rem",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    textDecoration: "none"
                }}
            >
                <span>←</span> {displayLabel}
            </Link>
        );
    }

    return (
        <button
            onClick={() => router.back()}
            className="btn"
            style={{
                background: "transparent",
                color: "var(--text-muted)",
                padding: "8px 0",
                fontSize: "0.9rem",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
            }}
        >
            <span>←</span> {displayLabel}
        </button>
    );
}
