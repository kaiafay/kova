"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { DesktopOnlyStub } from "@/components/desktop-only-stub";

const Desktop = dynamic(() => import("./_desktop"), { ssr: false });

export default function SettingsPage() {
  const tier = useDeviceTier();
  if (!tier) return null;
  if (tier === "mobile") return (
    <DesktopOnlyStub
      title="Settings"
      copy="For full budgeting tools and table editing, open Kova in a desktop browser."
    />
  );
  return <Desktop />;
}
