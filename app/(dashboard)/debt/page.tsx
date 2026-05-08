"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { DesktopOnlyStub } from "@/components/desktop-only-stub";

const Desktop = dynamic(() => import("./_desktop"), { ssr: false });

export default function DebtPage() {
  const tier = useDeviceTier();
  if (!tier) return null;
  if (tier === "mobile") return (
    <DesktopOnlyStub
      title="Debt"
      copy="The Debt planner is desktop-only. Open Kova on desktop to see payoff progress, payment history, and strategy planning."
    />
  );
  return <Desktop />;
}
