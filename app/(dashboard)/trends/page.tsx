"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { DesktopOnlyStub } from "@/components/desktop-only-stub";

const Desktop = dynamic(() => import("./_desktop"), { ssr: false });

export default function TrendsPage() {
  const tier = useDeviceTier();
  if (tier === "mobile") return (
    <DesktopOnlyStub
      title="Trends"
      copy="Trends is desktop-only. Open Kova on desktop for month-over-month charts and full breakdowns."
    />
  );
  return <Desktop />;
}
