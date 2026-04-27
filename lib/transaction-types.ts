export const TRANSACTION_TYPES = [
  "INCOME",
  "BILLS",
  "EXPENSES",
  "DEBT PAYMENT",
  "SUBSCRIPTIONS",
] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];

export const TYPE_META: Record<TransactionType, { color: string; bg: string; label: string }> = {
  "INCOME":        { color: "#16a34a", bg: "#dcfce7", label: "Income" },
  "BILLS":         { color: "#0284c7", bg: "#e0f2fe", label: "Bills" },
  "EXPENSES":      { color: "#7c3aed", bg: "#ede9fe", label: "Expenses" },
  "DEBT PAYMENT":  { color: "#dc2626", bg: "#fee2e2", label: "Debt" },
  "SUBSCRIPTIONS": { color: "#d97706", bg: "#fef3c7", label: "Subscriptions" },
};
