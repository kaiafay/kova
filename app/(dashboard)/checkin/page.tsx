"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { DesktopOnlyStub } from "@/components/desktop-only-stub";

const Desktop = dynamic(() => import("./_desktop"), { ssr: false });

export default function CheckinPage() {
  const tier = useDeviceTier();
  if (tier === "mobile") return (
    <DesktopOnlyStub
      title="Check-in"
      copy="Weekly check-in is available on desktop only so you can review the full budget context before confirming."
    />
  );
  return <Desktop />;
}
