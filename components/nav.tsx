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
  const isTablet = tier === "tablet";
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkStyle = (active: boolean) => ({
    padding: isTablet ? "6px 10px" : "7px 16px",
    borderRadius: 7,
    fontSize: isTablet ? 12.5 : 13.5,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.12s",
    whiteSpace: "nowrap" as const,
    background: active ? "#eff6ff" : "transparent",
    color: active ? C.accent : C.muted,
  });

  return (
    <div className="kova-nav-wrap">
      <div className="kova-nav-inner" style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", height: 60, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <BudgetSwitcher compact={isTablet} />

        {!isMobile && (
          <div style={{ display: "flex", gap: isTablet ? 0 : 2, minWidth: 0 }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={linkStyle(pathname === href)}>{label}</Link>
            ))}
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: isTablet ? 8 : 12 }}>
          {!isMobile && !isTablet && (
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
              style={{
                border: `1px solid ${C.border}`,
                background: "transparent",
                borderRadius: 8,
                width: 44,
                height: 44,
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 0,
              }}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <g
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? "rotate(-8deg) scale(0.97)" : "rotate(0deg) scale(1)",
                    transformOrigin: "9px 9px",
                    transition: "opacity 180ms ease, transform 220ms ease",
                  }}
                >
                  <line x1="2" y1="4" x2="16" y2="4" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2" y1="9" x2="16" y2="9" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2" y1="14" x2="16" y2="14" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
                </g>
                <g
                  style={{
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? "rotate(0deg) scale(1)" : "rotate(8deg) scale(0.97)",
                    transformOrigin: "9px 9px",
                    transition: "opacity 180ms ease, transform 220ms ease",
                  }}
                >
                  <polyline
                    points="4,11 9,6 14,11"
                    stroke={C.muted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
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
