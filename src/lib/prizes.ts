/**
 * Prize-per-position payout table from the official SoloQ Challenge rules (Low Elo bracket),
 * used only to show what a position would be worth — not to reproduce the tournament's
 * branding, special award categories, or design. Update this if the organizers change it.
 */
const POSITION_PRIZE_EUR: Record<number, number> = {
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

export function prizeForPosition(position: number): number | null {
  return POSITION_PRIZE_EUR[position] ?? null;
}

export function formatPrizeEur(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
