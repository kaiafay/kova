"use client";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/lib/use-device-tier";
import { MobileTransactions } from "../_transactions/MobileTransactions";

const DesktopTransactions = dynamic(
  () => import("../_transactions/DesktopTransactions").then(m => m.DesktopTransactions),
  { ssr: false },
);

export default function TransactionsPage() {
  const tier = useDeviceTier();
  if (tier === "mobile") return <MobileTransactions />;
  return <DesktopTransactions />;
}
