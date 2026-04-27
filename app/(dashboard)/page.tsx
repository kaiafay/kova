"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { MobileOverview } from "./_overview/MobileOverview";

const DesktopOverview = dynamic(
  () => import("./_overview/DesktopOverview").then(m => m.DesktopOverview),
  { ssr: false },
);

export default function OverviewPage() {
  const tier = useDeviceTier();
  if (tier === "mobile") return <MobileOverview />;
  return <DesktopOverview />;
}
