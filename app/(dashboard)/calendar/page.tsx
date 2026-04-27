"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { DesktopOnlyStub } from "@/components/desktop-only-stub";

const Desktop = dynamic(() => import("./_desktop"), { ssr: false });

export default function CalendarPage() {
  const tier = useDeviceTier();
  if (!tier) return null;
  if (tier === "mobile") return (
    <DesktopOnlyStub
      title="Calendar"
      copy="Calendar is available on desktop only. Open Kova on desktop for monthly bill and transaction date review."
    />
  );
  return <Desktop />;
}
