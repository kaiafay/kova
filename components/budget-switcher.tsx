"use client";

import { useState } from "react";
import { useOrganization, useOrganizationList, useClerk } from "@clerk/nextjs";
import { KovaGem } from "./kova-gem";

const C = { bg:"#f8fafc", surf:"#ffffff", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", subtle:"#94a3b8", accent:"#2563eb" };

export function BudgetSwitcher() {
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({ userMemberships: true });
  const { openOrganizationProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const orgs = userMemberships?.data ?? [];

  const switchOrg = async (orgId: string) => {
    if (setActive) {
      await setActive({ organization: orgId });
      window.location.reload();
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, marginRight: 28 }}>
      <KovaGem size={24} />
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
          borderRadius: 7, fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 800, color: C.accent, letterSpacing: -0.5 }}>
          {organization?.name ?? "Kova"}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50,
            background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 220, padding: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: 0.6, padding: "6px 10px 4px" }}>
              Your Budgets
            </div>
            {orgs.map(m => (
              <button
                key={m.organization.id}
                onClick={() => switchOrg(m.organization.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7,
                  border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5,
                  background: m.organization.id === organization?.id ? "#eff6ff" : "transparent",
                  color: m.organization.id === organization?.id ? C.accent : C.text,
                  fontWeight: m.organization.id === organization?.id ? 700 : 400,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                {m.organization.name}
                {m.organization.id === organization?.id && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>✓</span>
                )}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "6px 0" }} />
            <button
              onClick={() => { setOpen(false); window.location.href = "/onboarding"; }}
              style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, color: C.muted, background: "transparent" }}
            >
              + New Budget
            </button>
            <button
              onClick={() => { setOpen(false); openOrganizationProfile(); }}
              style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, color: C.muted, background: "transparent" }}
            >
              Invite partner
            </button>
          </div>
        </>
      )}
    </div>
  );
}
