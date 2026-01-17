"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back" }: { label?: string }) {
    const router = useRouter();

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
            <span>←</span> {label}
        </button>
    );
}
