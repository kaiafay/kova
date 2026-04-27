"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BudgetSwitcher } from "./budget-switcher";
import { useDeviceTier } from "@/lib/use-device-tier";

const C = { surf: "#ffffff", border: "#e2e8f0", muted: "#64748b", accent: "#2563eb" };

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/trends", label: "Trends" },
  { href: "/checkin", label: "Check-in" },
  { href: "/settings", label: "Settings" },
];
const MOBILE_NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/settings", label: "Settings" },
];

export function Nav({ onCheckin }: { onCheckin: () => void }) {
  const pathname = usePathname();
  const tier = useDeviceTier();
  const isMobile = tier === "mobile";
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkStyle = (active: boolean) => ({
    padding: "7px 16px",
    borderRadius: 7,
    fontSize: 13.5,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.12s",
    background: active ? "#eff6ff" : "transparent",
    color: active ? C.accent : C.muted,
  });

  return (
    <div className="kova-nav-wrap">
      <div className="kova-nav-inner" style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", height: 60, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <BudgetSwitcher />

        {!isMobile && (
          <div style={{ display: "flex", gap: 2 }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={linkStyle(pathname === href)}>{label}</Link>
            ))}
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {!isMobile && (
            <button
              onClick={onCheckin}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "0.5px solid #bfdbfe", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                background: "#eff6ff", color: C.accent, display: "flex", alignItems: "center", gap: 7,
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
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{ border: `1px solid ${C.border}`, background: "transparent", borderRadius: 8, minWidth: 44, minHeight: 44, cursor: "pointer" }}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                {mobileOpen ? (
                  <>
                    <line x1="1" y1="1" x2="17" y2="13" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17" y1="1" x2="1" y2="13" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                  </>
                ) : (
                  <>
                    <line x1="0" y1="1" x2="18" y2="1" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="7" x2="18" y2="7" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="13" x2="18" y2="13" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
          )}

          <UserButton />
        </div>
      </div>

      {isMobile && mobileOpen && (
        <div style={{
          display: "flex", position: "absolute", top: 60, left: 0, right: 0, zIndex: 100,
          flexDirection: "column", gap: 2, padding: "8px 16px 12px",
          borderBottom: `1px solid ${C.border}`, background: "#ffffff",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
        }}>
          {MOBILE_NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{ ...linkStyle(pathname === href), padding: "12px 16px", borderRadius: 8 }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
