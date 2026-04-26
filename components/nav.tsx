"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BudgetSwitcher } from "./budget-switcher";

const C = { surf: "#ffffff", border: "#e2e8f0", muted: "#64748b", accent: "#2563eb" };

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/trends", label: "Trends" },
  { href: "/checkin", label: "Check-in" },
  { href: "/settings", label: "Settings" },
];

export function Nav({ onCheckin }: { onCheckin: () => void }) {
  const pathname = usePathname();

  return (
    <div style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", height: 60, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <BudgetSwitcher />
      <div style={{ display: "flex", gap: 2 }}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: "7px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: 500,
                textDecoration: "none", transition: "all 0.12s",
                background: active ? "#eff6ff" : "transparent",
                color: active ? C.accent : C.muted,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onCheckin}
          style={{
            padding: "6px 14px", borderRadius: 8, border: "0.5px solid #bfdbfe", cursor: "pointer",
            fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
            background: "#eff6ff", color: C.accent,
            display: "flex", alignItems: "center", gap: 7,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 36,16 24,22 12,16" fill={C.accent} opacity="0.9"/>
            <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
            <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
            <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
          </svg>
          Kova check-in
        </button>
        <UserButton />
      </div>
    </div>
  );
}
