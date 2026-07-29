/**
 * Prize-per-position payout tables from the official SoloQ Challenge rules, used only to show
 * what a position would be worth — not to reproduce the tournament's branding, special award
 * categories (best-per-role, best autofill, etc.), or design. Update these if the organizers
 * change them.
 */
const POSITION_PRIZE_EUR_HIGH_ELO: Record<number, number> = {
  1: 30000,
  2: 15000,
  3: 7000,
  4: 4000,
  5: 2500,
  6: 2000,
  7: 1500,
  8: 1000,
  9: 700,
  10: 300,
};

const POSITION_PRIZE_EUR_LOW_ELO: Record<number, number> = {
  1: 12500,
  2: 6500,
  3: 3000,
  4: 1800,
  5: 1100,
  6: 800,
  7: 600,
  8: 400,
  9: 200,
  10: 100,
};

export type EloBracket = "HIGH_ELO" | "LOW_ELO";

export function prizeForPosition(position: number, bracket: EloBracket): number | null {
  const table = bracket === "HIGH_ELO" ? POSITION_PRIZE_EUR_HIGH_ELO : POSITION_PRIZE_EUR_LOW_ELO;
  return table[position] ?? null;
}

export function formatPrizeEur(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
