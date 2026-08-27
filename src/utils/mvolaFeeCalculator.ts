import type {
  CalculationResult,
  DirectResult,
  FeeTier,
  OptimizedResult,
  Withdrawal,
} from '../types/mvola';

/**
 * Grille tarifaire officielle MVola (Cash Point), de 100 à 20 000 000 Ar.
 *
 * NB : le retrait effectué par un non-abonné MVola (case "RETRAIT PAR UN NON
 * ABONNÉ MVOLA" du tableau tarifaire) est gratuit mais correspond à un autre
 * type d'opération que le retrait "Cash Point" standard modélisé ici ; il
 * n'est donc volontairement pas inclus dans cette grille.
 */
export const FEE_TIERS: FeeTier[] = [
  { min: 100, max: 1_000, fee: 100 },
  { min: 1_001, max: 5_000, fee: 150 },
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
  { min: 5_000_001, max: 6_000_000, fee: 34_300 },
  { min: 6_000_001, max: 7_000_000, fee: 39_200 },
  { min: 7_000_001, max: 8_000_000, fee: 44_100 },
  { min: 8_000_001, max: 9_000_000, fee: 49_000 },
  { min: 9_000_001, max: 10_000_000, fee: 53_900 },
  { min: 10_000_001, max: 11_000_000, fee: 59_000 },
  { min: 11_000_001, max: 12_000_000, fee: 64_000 },
  { min: 12_000_001, max: 13_000_000, fee: 69_000 },
  { min: 13_000_001, max: 14_000_000, fee: 74_000 },
  { min: 14_000_001, max: 15_000_000, fee: 79_000 },
  { min: 15_000_001, max: 16_000_000, fee: 84_000 },
  { min: 16_000_001, max: 17_000_000, fee: 89_000 },
  { min: 17_000_001, max: 18_000_000, fee: 94_000 },
  { min: 18_000_001, max: 19_000_000, fee: 98_000 },
  { min: 19_000_001, max: 20_000_000, fee: 100_000 },
];

export const MIN_AMOUNT = FEE_TIERS[0].min;
export const MAX_AMOUNT = FEE_TIERS[FEE_TIERS.length - 1].max;

/**
 * Sommets de tous les paliers du barème, utilisés comme "dénominations"
 * candidates pour tester les fractionnements. Triés par ordre croissant.
 * Tous étant des multiples de 1 000 Ar, l'espace d'états explorable par
 * `calculateOptimizedSplit` reste borné à ~ montant / 1 000 (voir plus bas).
 */
const SPLIT_BREAKPOINTS: readonly number[] = FEE_TIERS.map((t) => t.max);

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

type SplitState = { fee: number; withdrawals: Withdrawal[] };

/**
 * Calcule, par programmation dynamique mémoïsée, la meilleure décomposition
 * de `target` en une somme de sommets de palier (+ un reliquat direct) qui
 * minimise le total des frais MVola.
 *
 * Implémentation itérative (pile explicite, pas de récursion native) pour
 * ne jamais risquer de dépassement de pile d'appel, même sur de gros
 * montants. Comme tous les sommets de palier (`SPLIT_BREAKPOINTS`) sont des
 * multiples de 1 000 Ar, tous les montants intermédiaires rencontrés
 * partagent le même reste modulo 1 000 que `target` : le nombre d'états
 * distincts est donc borné par `target / 1 000` (~20 000 états au maximum
 * pour 20 000 000 Ar), ce qui reste largement gérable en performance.
 */
function bestDecomposition(target: number): SplitState {
  const memo = new Map<number, SplitState>();
  const stack: number[] = [target];

  while (stack.length > 0) {
    const amount = stack[stack.length - 1];

    if (amount <= 0) {
      memo.set(amount, { fee: 0, withdrawals: [] });
      stack.pop();
      continue;
    }
    if (memo.has(amount)) {
      stack.pop();
      continue;
    }

    const candidates = SPLIT_BREAKPOINTS.filter((bp) => bp <= amount);
    const missing = candidates
      .map((bp) => amount - bp)
      .filter((rest) => rest > 0 && !memo.has(rest));

    if (missing.length > 0) {
      // Les dépendances (montants restants) ne sont pas encore résolues :
      // on les empile et on retraite `amount` une fois qu'elles le seront.
      for (const rest of missing) stack.push(rest);
      continue;
    }

    // Cas de base : retirer tout `amount` en une seule fois (si couvert par le barème).
    let bestFee = Infinity;
    let bestWithdrawals: Withdrawal[] = [];
    const isUnsplittableRemainder = amount !== target && amount < MIN_AMOUNT;
    const directFee = isUnsplittableRemainder ? null : getFeeForAmount(amount);
    if (directFee !== null) {
      bestFee = directFee;
      bestWithdrawals = [{ amount, fee: directFee }];
    }

    // Cas récursif : prélever un sommet de palier puis compléter avec le reste optimal.
    for (const bp of candidates) {
      const chunkFee = getFeeForAmount(bp)!;
      const rest = amount - bp;
      const restResult = rest > 0 ? memo.get(rest)! : { fee: 0, withdrawals: [] };
      const totalFee = chunkFee + restResult.fee;
      if (totalFee < bestFee) {
        bestFee = totalFee;
        bestWithdrawals = [{ amount: bp, fee: chunkFee }, ...restResult.withdrawals];
      }
    }

    memo.set(amount, { fee: bestFee, withdrawals: bestWithdrawals });
    stack.pop();
  }

  return memo.get(target)!;
}

/**
 * Recherche, parmi toutes les décompositions possibles en sommets de
 * palier du barème (+ un reliquat), celle qui minimise la somme des frais
 * MVola pour `amount`.
 */
export function calculateOptimizedSplit(amount: number): OptimizedResult {
  if (amount <= 0) {
    return { withdrawals: [], totalFee: 0, totalWithdrawn: 0 };
  }

  const { fee, withdrawals } = bestDecomposition(amount);

  if (!Number.isFinite(fee)) {
    // Aucune décomposition valide trouvée (ne devrait plus arriver en
    // pratique, y compris au-delà de MAX_AMOUNT, grâce au chaînage de
    // retraits au sommet le plus haut du barème).
    return { withdrawals: [], totalFee: 0, totalWithdrawn: 0 };
  }

  return {
    withdrawals,
    totalFee: fee,
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