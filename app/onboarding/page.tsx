"use client";

import { Suspense, useState, useEffect } from "react";
import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

const C = { bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", accent: "#2563eb" };

function OnboardingContent() {
  const { userMemberships, isLoaded, createOrganization, setActive } = useOrganizationList({ userMemberships: true });
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewBudget = searchParams.get("new") === "1";
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNewBudget) return;
    if (isLoaded && userMemberships?.data && userMemberships.data.length > 0) {
      router.replace("/");
    }
  }, [isLoaded, userMemberships, router, isNewBudget]);

  const createBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !createOrganization || !setActive) return;
    setLoading(true);
    setError("");
    try {
      const org = await createOrganization({ name: name.trim() });
      await setActive({ organization: org.id });
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 16, padding: 40, maxWidth: 480, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 36,16 24,22 12,16" fill="#2563eb" opacity="0.9" />
            <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75" />
            <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85" />
            <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6" />
            <line x1="24" y1="4" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.9" />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.accent, letterSpacing: -0.5 }}>Kova</span>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: -0.5 }}>Welcome{user?.firstName ? `, ${user.firstName}` : ""}!</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>Set up your shared budget to get started.</div>

        <form onSubmit={createBudget} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Create a new budget</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", color: C.text, background: C.surf }}
              placeholder="e.g. Kaia &amp; Rich Joint"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{ padding: "10px 20px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>{error}</div>}
        </form>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Join an existing budget</div>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Ask your partner to invite you from the budget switcher inside Kova. Once they send an invite, accept it from your email and you&apos;ll be added automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
