import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  createdBy: text("created_by").notNull(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("transactions_org_id_idx").on(t.orgId),
]);

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  budgetAmount: numeric("budget_amount").notNull(),
  dueDay: integer("due_day"),
  startingBalance: numeric("starting_balance"),
}, (t) => [
  index("budgets_org_id_idx").on(t.orgId),
]);

export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  createdBy: text("created_by").notNull(),
  date: text("date").notNull(),
  weekSpend: numeric("week_spend"),
  weekDebt: numeric("week_debt"),
  topCatName: text("top_cat_name"),
  topCatAmount: numeric("top_cat_amount"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("checkins_org_id_idx").on(t.orgId),
]);

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull().unique(),
  creatorId: text("creator_id"),
  checkinDay: integer("checkin_day").default(0),
  startingBalance: numeric("starting_balance").default("0"),
  merchantMap: jsonb("merchant_map").default({}),
  monthlyNotes: jsonb("monthly_notes").default({}),
});
