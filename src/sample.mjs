// Every person, label, date, and amount produced here is fictional.
export const SEED = 20261026;

function random(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let x = value;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const templates = [
  ["Synthetic Salary", "credit", 90000, 115000],
  ["Sample Rent", "debit", 26000, 31000],
  ["Fixture Grocer", "debit", 4200, 8800],
  ["Demo Transit", "debit", 900, 2600],
  ["Sample Utility", "debit", 1200, 3400],
  ["Fixture Health", "debit", 800, 3200],
  ["Demo Cafe", "debit", 500, 2100],
  ["Synthetic Freelance", "credit", 5500, 12500]
];

const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
const decimal = (cents) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

export function generateSample() {
  const next = random(SEED);
  const rows = [];
  const balanceByStatement = { "STATEMENT-01": 250000, "STATEMENT-02": 180000 };
  let sequence = 1;
  for (let month = 1; month <= 3; month++) {
    for (const statementId of Object.keys(balanceByStatement)) {
      templates.forEach(([description, direction, low, high], index) => {
        const cents = low + Math.floor(next() * (high - low + 1));
        const date = `2026-${String(month).padStart(2, "0")}-${String(3 + index * 3).padStart(2, "0")}`;
        rows.push({ id: `SYN-${String(sequence++).padStart(3, "0")}`, statementId, date, description, direction, amount: decimal(cents) });
        balanceByStatement[statementId] += direction === "credit" ? cents : -cents;
      });
    }
  }
  rows.push({ ...rows[5], id: `SYN-${String(sequence++).padStart(3, "0")}` });
  rows.push({ ...rows[20], id: `SYN-${String(sequence++).padStart(3, "0")}` });
  rows.push({ id: `SYN-${String(sequence++).padStart(3, "0")}`, statementId: "STATEMENT-02", date: "2026-03-28", description: "Unmapped Fixture", direction: "debit", amount: "12.34" });
  balanceByStatement["STATEMENT-02"] -= 1234;
  rows.push({ id: `SYN-${String(sequence++).padStart(3, "0")}`, statementId: "STATEMENT-02", date: "2026-03-29", description: "Malformed Fixture", direction: "debit", amount: "invalid" });

  const controls = {
    synthetic: true,
    seed: SEED,
    period: "2026-01 to 2026-03 (fictional)",
    sourceLabel: "Generated sample CSV and statement controls",
    statements: [
      { id: "STATEMENT-01", openingCents: 250000, closingCents: balanceByStatement["STATEMENT-01"] },
      { id: "STATEMENT-02", openingCents: 180000, closingCents: balanceByStatement["STATEMENT-02"] + 731 }
    ],
    budgetsCents: { Housing: 185000, Groceries: 52000, Mobility: 18000, Utilities: 18000, Health: 16500, Dining: 11500 },
    fixtureNote: "STATEMENT-02 has an intentional 7.31 synthetic discrepancy for manual review."
  };
  const header = ["id", "statementId", "date", "description", "direction", "amount"];
  const csv = [header.join(","), ...rows.map((row) => header.map((key) => csvCell(row[key])).join(","))].join("\n") + "\n";
  return { csv, controls };
}
