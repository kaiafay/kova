#!/usr/bin/env node

import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

const TAG = "[demo-seed-v1]";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i++;
  }
  return args;
}

function createRng(initial = 42) {
  let seed = initial >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function money(rand, min, max) {
  return Number((min + rand() * (max - min)).toFixed(2));
}

function monthStart(offsetMonths) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
}

function buildTransactions(months, rand) {
  const txns = [];
  for (const mStart of months) {
    const y = mStart.getFullYear();
    const m = mStart.getMonth();

    txns.push(
      { date: formatDate(new Date(y, m, 1)), name: "Primary Salary", type: "INCOME", amount: 5200, notes: TAG },
      { date: formatDate(new Date(y, m, 15)), name: "Side Income", type: "INCOME", amount: 850, notes: TAG },
      { date: formatDate(new Date(y, m, 1)), name: "Rent / Mortgage", type: "BILLS", amount: 1850, notes: TAG },
      { date: formatDate(new Date(y, m, 3)), name: "Electric", type: "BILLS", amount: money(rand, 90, 160), notes: TAG },
      { date: formatDate(new Date(y, m, 5)), name: "Internet", type: "BILLS", amount: 79.99, notes: TAG },
      { date: formatDate(new Date(y, m, 7)), name: "Cell Phone", type: "BILLS", amount: 95, notes: TAG },
      { date: formatDate(new Date(y, m, 12)), name: "Car Insurance", type: "BILLS", amount: 142, notes: TAG },
      { date: formatDate(new Date(y, m, 20)), name: "Gym", type: "SUBSCRIPTIONS", amount: 49.99, notes: TAG },
      { date: formatDate(new Date(y, m, 22)), name: "Streaming Services", type: "SUBSCRIPTIONS", amount: 34.99, notes: TAG },
      { date: formatDate(new Date(y, m, 25)), name: "Credit Card", type: "DEBT PAYMENT", amount: 400, notes: TAG },
    );

    const variableCats = [
      ["Groceries", "EXPENSES", 90, 220],
      ["Gas", "EXPENSES", 35, 90],
      ["Dining Out", "EXPENSES", 20, 85],
      ["Entertainment", "EXPENSES", 25, 120],
      ["Health", "EXPENSES", 20, 80],
      ["Personal Care", "EXPENSES", 15, 60],
    ];
    for (let d = 2; d <= 28; d += 2) {
      const idx = Math.floor(rand() * variableCats.length);
      const [name, type, min, max] = variableCats[idx];
      txns.push({
        date: formatDate(new Date(y, m, d)),
        name,
        type,
        amount: money(rand, min, max),
        notes: TAG,
      });
    }
  }
  return txns;
}

function buildCheckins(months, rand) {
  const checkins = [];
  const topCats = ["Groceries", "Dining Out", "Gas", "Entertainment"];
  const reflections = ["steady", "a bit high", "under control", "improving"];

  for (const mStart of months) {
    const y = mStart.getFullYear();
    const m = mStart.getMonth();
    for (let d = 4; d <= 28; d += 7) {
      const topIdx = Math.floor(rand() * topCats.length);
      const reflectIdx = Math.floor(rand() * reflections.length);
      checkins.push({
        date: formatDate(new Date(y, m, d)),
        weekSpend: money(rand, 350, 900),
        weekDebt: money(rand, 50, 220),
        topCatName: topCats[topIdx],
        topCatAmount: money(rand, 90, 280),
        notes: `${TAG} Weekly reflection: spending felt ${reflections[reflectIdx]}.`,
      });
    }
  }
  return checkins;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const orgId = args["org-id"] ?? process.env.SEED_ORG_ID;
  const userId = args["user-id"] ?? process.env.SEED_USER_ID;
  const monthsCountRaw = args.months ?? "2";
  const clean = args.clean !== "false";
  const seedNum = Number(args.seed ?? "42");
  const monthsCount = Number(monthsCountRaw);

  if (!orgId || !userId) {
    console.error("Missing required IDs.");
    console.error("Usage: npm run seed:demo -- --org-id org_xxx --user-id user_xxx [--months 2] [--seed 42] [--clean true]");
    process.exit(1);
  }
  if (!Number.isInteger(monthsCount) || monthsCount <= 0 || monthsCount > 24) {
    console.error("--months must be an integer between 1 and 24");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env or .env.local");
    process.exit(1);
  }

  const rand = createRng(seedNum);
  const months = Array.from({ length: monthsCount }, (_, i) => monthStart(-(monthsCount - 1 - i)));
  const transactions = buildTransactions(months, rand);
  const checkins = buildCheckins(months, rand);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (clean) {
      await client.query(
        "DELETE FROM transactions WHERE org_id = $1 AND notes LIKE $2",
        [orgId, `%${TAG}%`],
      );
      await client.query(
        "DELETE FROM checkins WHERE org_id = $1 AND notes LIKE $2",
        [orgId, `%${TAG}%`],
      );
    }

    for (const t of transactions) {
      await client.query(
        `INSERT INTO transactions (org_id, created_by, date, name, type, amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orgId, userId, t.date, t.name, t.type, String(t.amount), t.notes],
      );
    }

    for (const c of checkins) {
      await client.query(
        `INSERT INTO checkins (org_id, created_by, date, week_spend, week_debt, top_cat_name, top_cat_amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orgId,
          userId,
          c.date,
          String(c.weekSpend),
          String(c.weekDebt),
          c.topCatName,
          String(c.topCatAmount),
          c.notes,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(`Seed complete for org ${orgId}`);
    console.log(`Inserted ${transactions.length} transactions and ${checkins.length} check-ins across ${monthsCount} month(s).`);
    console.log(`Re-run with same --seed for deterministic values.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
