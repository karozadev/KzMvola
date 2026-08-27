import type {
  CalculationResult,
  DirectResult,
  FeeTier,
  OptimizedResult,
  Withdrawal,
} from '../types/mvola';

/** Grille tarifaire officielle MVola (Cash Point). */
export const FEE_TIERS: FeeTier[] = [
  { min: 100, max: 1_000, fee: 0 },
  { min: 1_001, max: 5_000, fee: 100 },
  { min: 5_001, max: 10_000, fee: 275 },
  { min: 10_001, max: 20_000, fee: 550 },
  { min: 20_001, max: 25_000, fee: 650 },
  { min: 25_001, max: 50_000, fee: 1_300 },
  { min: 50_001, max: 100_000, fee: 1_900 },
  { min: 100_001, max: 250_000, fee: 3_400 },
  { min: 250_001, max: 500_000, fee: 4_700 },
  { min: 500_001, max: 1_000_000, fee: 8_800 },
  { min: 1_000_001, max: 2_000_000, fee: 14_700 },
  { min: 2_000_001, max: 3_000_000, fee: 19_600 },
  { min: 3_000_001, max: 4_000_000, fee: 24_500 },
  { min: 4_000_001, max: 5_000_000, fee: 29_400 },
];

export const MIN_AMOUNT = FEE_TIERS[0].min;
export const MAX_AMOUNT = FEE_TIERS[FEE_TIERS.length - 1].max;

/** Sommets de paliers utilisés comme "dénominations" pour tester les fractionnements. */
const SPLIT_BREAKPOINTS = [1_000_000, 500_000, 250_000] as const;

/**
 * Renvoie le frais MVola applicable à un montant, ou `null` si le montant
 * est en dehors de la plage couverte par la grille tarifaire (0 à MAX_AMOUNT).
 */
export function getFeeForAmount(amount: number): number | null {
  if (amount <= 0) return 0;
  if (amount > MAX_AMOUNT) return null;

  const tier = FEE_TIERS.find((t) => amount >= t.min && amount <= t.max);
  // Sous le premier palier (< 100 Ar) : aucun frais.
  return tier ? tier.fee : 0;
}

/** Calcule le coût d'un retrait effectué en une seule transaction. */
export function calculateDirect(amount: number): DirectResult {
  const fee = getFeeForAmount(amount);
  return {
    possible: fee !== null,
    amount,
    fee,
  };
}

/**
 * Recherche exhaustive, parmi les combinaisons de retraits calés sur les
 * sommets de paliers clés (1 000 000 / 500 000 / 250 000 Ar), de la
 * décomposition qui minimise la somme des frais MVola pour `amount`.
 */
export function calculateOptimizedSplit(amount: number): OptimizedResult {
  if (amount <= 0) {
    return { withdrawals: [], totalFee: 0, totalWithdrawn: 0 };
  }

  const [big, medium, small] = SPLIT_BREAKPOINTS;
  let best: { counts: [number, number, number]; remainder: number; totalFee: number } | null =
    null;

  const maxBig = Math.floor(amount / big);
  for (let countBig = 0; countBig <= maxBig; countBig++) {
    const afterBig = amount - countBig * big;

    const maxMedium = Math.floor(afterBig / medium);
    for (let countMedium = 0; countMedium <= maxMedium; countMedium++) {
      const afterMedium = afterBig - countMedium * medium;

      const maxSmall = Math.floor(afterMedium / small);
      for (let countSmall = 0; countSmall <= maxSmall; countSmall++) {
        const remainder = afterMedium - countSmall * small;
        const remainderFee = remainder > 0 ? getFeeForAmount(remainder) : 0;

        // Une combinaison dont le reste dépasse la grille tarifaire est invalide.
        if (remainderFee === null) continue;

        const totalFee =
          countBig * (getFeeForAmount(big) ?? 0) +
          countMedium * (getFeeForAmount(medium) ?? 0) +
          countSmall * (getFeeForAmount(small) ?? 0) +
          remainderFee;

        if (best === null || totalFee < best.totalFee) {
          best = { counts: [countBig, countMedium, countSmall], remainder, totalFee };
        }
      }
    }
  }

  if (best === null) {
    // Montant hors grille tarifaire (> MAX_AMOUNT) : aucune décomposition valide.
    return { withdrawals: [], totalFee: 0, totalWithdrawn: 0 };
  }

  const withdrawals: Withdrawal[] = [];
  const [countBig, countMedium, countSmall] = best.counts;

  for (let i = 0; i < countBig; i++) withdrawals.push({ amount: big, fee: getFeeForAmount(big)! });
  for (let i = 0; i < countMedium; i++)
    withdrawals.push({ amount: medium, fee: getFeeForAmount(medium)! });
  for (let i = 0; i < countSmall; i++)
    withdrawals.push({ amount: small, fee: getFeeForAmount(small)! });
  if (best.remainder > 0) {
    withdrawals.push({ amount: best.remainder, fee: getFeeForAmount(best.remainder)! });
  }

  return {
    withdrawals,
    totalFee: best.totalFee,
    totalWithdrawn: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  };
}

/** Calcule et compare l'option de retrait direct et l'option optimisée pour un montant donné. */
export function calculateMvolaFees(amount: number): CalculationResult {
  const direct = calculateDirect(amount);
  const optimized = calculateOptimizedSplit(amount);

  const directFee = direct.possible ? (direct.fee ?? 0) : Infinity;
  const savings = direct.possible ? Math.max(0, directFee - optimized.totalFee) : 0;

  return { amount, direct, optimized, savings };
}
