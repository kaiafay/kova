"use client";

import { useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { KovaGem } from "./kova-gem";
import { useBudget } from "@/lib/budget-context";

const C = {
  bg: "#f8fafc",
  surf: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  accent: "#2563eb",
};

export function BudgetSwitcher() {
  const { organization } = useOrganization();
  const { userMemberships, setActive, createOrganization } =
    useOrganizationList({ userMemberships: true });
  const { isOwner } = useBudget();
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newBudgetOpen, setNewBudgetOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [members, setMembers] = useState<{ userId: string; firstName: string | null; lastName: string | null; identifier: string; isCreator: boolean; isCurrentUser: boolean }[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const orgs = userMemberships?.data ?? [];

  const switchOrg = async (orgId: string) => {
    setOpen(false);
    if (setActive) {
      await setActive({ organization: orgId });
    }
  };

  const openManage = async () => {
    setOpen(false);
    setMembersError("");
    setMembersLoading(true);
    setManageOpen(true);
    try {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error(await res.text());
      setMembers(await res.json());
    } catch (err: unknown) {
      setMembersError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMembersLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const isSelf = members.find((m) => m.userId === userId)?.isCurrentUser ?? false;
      const res = await fetch(`/api/members/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      if (isSelf) {
        window.location.href = "/onboarding";
      }
    } catch (err: unknown) {
      setMembersError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const openInvite = () => {
    setOpen(false);
    setEmail("");
    setInviteError("");
    setInviteSuccess(false);
    setInviteOpen(true);
  };

  const sendInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !organization) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      await organization.inviteMember({ emailAddress: email.trim(), role: "org:admin" });
      await organization.reload();
      setInviteSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInviteLoading(false);
    }
  };

  const openNewBudget = () => {
    setOpen(false);
    setName("");
    setError("");
    setNewBudgetOpen(true);
  };

  const createBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !createOrganization || !setActive) return;
    setLoading(true);
    setError("");
    try {
      const org = await createOrganization({ name: name.trim() });
      await setActive({ organization: org.id });
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: 28,
        }}
      >
        <KovaGem size={24} />
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 8px",
            borderRadius: 7,
            fontFamily: "inherit",
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: C.accent,
              letterSpacing: -0.5,
            }}
          >
            {organization?.name ?? "Kova"}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <g
              style={{
                opacity: open ? 0 : 1,
                transform: open ? "rotate(-8deg) scale(0.97)" : "rotate(0deg) scale(1)",
                transformOrigin: "6px 6px",
                transition: "opacity 210ms ease, transform 250ms ease",
              }}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke={C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <g
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "rotate(0deg) scale(1)" : "rotate(8deg) scale(0.97)",
                transformOrigin: "6px 6px",
                transition: "opacity 210ms ease, transform 250ms ease",
              }}
            >
              <path
                d="M2 8l4-4 4 4"
                stroke={C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </button>

        {open && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 50,
                background: C.surf,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                minWidth: 220,
                padding: 6,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.subtle,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  padding: "6px 10px 4px",
                }}
              >
                Your Budgets
              </div>
              {orgs.map((m) => (
                <button
                  key={m.organization.id}
                  onClick={() => switchOrg(m.organization.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    background:
                      m.organization.id === organization?.id
                        ? "#eff6ff"
                        : "transparent",
                    color:
                      m.organization.id === organization?.id
                        ? C.accent
                        : C.text,
                    fontWeight:
                      m.organization.id === organization?.id ? 700 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {m.organization.name}
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {m.organization.membersCount > 1 && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
                        <circle cx="5.5" cy="5" r="2.5" fill="currentColor" />
                        <path d="M1 13c0-2.485 2.015-4.5 4.5-4.5S10 10.515 10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                        <circle cx="11" cy="5" r="2" fill="currentColor" opacity="0.7" />
                        <path d="M13 13c0-1.657-1.343-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
                      </svg>
                    )}
                    {m.organization.id === organization?.id && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>✓</span>
                    )}
                  </span>
                </button>
              ))}
              <div
                style={{ borderTop: `1px solid ${C.border}`, margin: "6px 0" }}
              />
              <button
                onClick={openNewBudget}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13.5,
                  color: C.muted,
                  background: "transparent",
                }}
              >
                + New Budget
              </button>
              {isOwner && (
                <button
                  onClick={openInvite}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    color: C.muted,
                    background: "transparent",
                  }}
                >
                  Invite collaborator
                </button>
              )}
              {organization?.membersCount != null && organization.membersCount > 1 && (
                <button
                  onClick={openManage}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    color: C.muted,
                    background: "transparent",
                  }}
                >
                  Manage collaborators
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {newBudgetOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15,23,42,0.4)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setNewBudgetOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 101,
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 36,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: C.text,
                  letterSpacing: -0.4,
                }}
              >
                New Budget
              </div>
              <button
                onClick={() => setNewBudgetOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.muted,
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 2,
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={createBudget}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                Give your budget a name to get started.
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  autoFocus
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: C.text,
                    background: C.surf,
                  }}
                  placeholder="e.g. Kaia & Rich Joint"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  style={{
                    padding: "10px 20px",
                    background: C.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading || !name.trim() ? 0.6 : 1,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
              {error && (
                <div style={{ fontSize: 12, color: "#dc2626" }}>{error}</div>
              )}
            </form>
          </div>
        </>
      )}
      {inviteOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15,23,42,0.4)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setInviteOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 101,
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 36,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
                Invite a collaborator
              </div>
              <button
                onClick={() => setInviteOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.muted,
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 2,
                }}
              >
                ×
              </button>
            </div>
            {inviteSuccess ? (
              <div>
                <div style={{ fontSize: 14, color: "#16a34a", marginBottom: 16 }}>
                  Invite sent! They&apos;ll receive an email to join <strong>{organization?.name}</strong>.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setInviteSuccess(false); }}
                    style={{
                      padding: "10px 20px",
                      background: C.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Invite another
                  </button>
                  <button
                    onClick={() => setInviteOpen(false)}
                    style={{
                      padding: "10px 20px",
                      background: "transparent",
                      color: C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={sendInvite}>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                  Enter your collaborator&apos;s email to invite them to <strong>{organization?.name}</strong>.
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    autoFocus
                    type="email"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "inherit",
                      outline: "none",
                      color: C.text,
                      background: C.surf,
                    }}
                    placeholder="collaborator@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={inviteLoading}
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading || !email.trim()}
                    style={{
                      padding: "10px 20px",
                      background: C.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: inviteLoading ? "not-allowed" : "pointer",
                      opacity: inviteLoading || !email.trim() ? 0.6 : 1,
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inviteLoading ? "Sending…" : "Send invite"}
                  </button>
                </div>
                {inviteError && (
                  <div style={{ fontSize: 12, color: "#dc2626" }}>{inviteError}</div>
                )}
              </form>
            )}
          </div>
        </>
      )}
      {manageOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15,23,42,0.4)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setManageOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 101,
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 36,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
                Collaborators
              </div>
              <button
                onClick={() => setManageOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.muted,
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 2,
                }}
              >
                ×
              </button>
            </div>
            {membersLoading ? (
              <div style={{ fontSize: 14, color: C.muted }}>Loading…</div>
            ) : membersError ? (
              <div style={{ fontSize: 13, color: "#dc2626" }}>{membersError}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {members.map((m) => {
                  const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.identifier;
                  const canRemove = members.some((x) => x.isCurrentUser && x.isCreator) && !m.isCreator;
                  const canLeave = m.isCurrentUser && !m.isCreator;
                  return (
                    <div
                      key={m.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: m.isCurrentUser ? "#f8fafc" : "transparent",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                          {name}
                          {m.isCreator && (
                            <span style={{ fontSize: 11, fontWeight: 500, color: C.subtle, marginLeft: 6 }}>
                              owner
                            </span>
                          )}
                        </div>
                        {name !== m.identifier && (
                          <div style={{ fontSize: 12, color: C.muted }}>{m.identifier}</div>
                        )}
                      </div>
                      {canRemove && (
                        <button
                          onClick={() => removeMember(m.userId)}
                          style={{
                            padding: "4px 10px",
                            background: "transparent",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      )}
                      {canLeave && (
                        <button
                          onClick={() => removeMember(m.userId)}
                          style={{
                            padding: "4px 10px",
                            background: "transparent",
                            color: C.muted,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
