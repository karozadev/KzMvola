import type {
  CalculationResult,
  DirectResult,
  FeeGrid,
  Operation,
  OptimizedResult,
} from '../types/mvola';

/** Montant minimum couvert par une grille (borne basse du premier palier). */
export function gridMin(grid: FeeGrid): number {
  return grid.tiers[0].min;
}

/** Montant maximum couvert par une grille (borne haute du dernier palier). */
export function gridMax(grid: FeeGrid): number {
  return grid.tiers[grid.tiers.length - 1].max;
}

/**
 * Sommets de tous les paliers d'une grille, utilisés comme « dénominations »
 * candidates pour tester les fractionnements. Triés par ordre croissant.
 * Tous les barèmes MVola ont des sommets multiples de 1 000 Ar : l'espace
 * d'états exploré par `bestDecomposition` reste borné à ~ montant / 1 000.
 */
function splitBreakpoints(grid: FeeGrid): number[] {
  return grid.tiers.map((t) => t.max);
}

/**
 * Renvoie le frais MVola applicable à un montant pour une grille donnée, ou
 * `null` si le montant dépasse le plafond couvert par la grille.
 */
export function getFeeForAmount(grid: FeeGrid, amount: number): number | null {
  if (amount <= 0) return 0;
  if (amount > gridMax(grid)) return null;

  const tier = grid.tiers.find((t) => amount >= t.min && amount <= t.max);
  // Sous le premier palier (montant < borne minimale) : aucun frais.
  return tier ? tier.fee : 0;
}

/** Calcule le coût d'une opération effectuée en une seule transaction. */
export function calculateDirect(grid: FeeGrid, amount: number): DirectResult {
  const fee = getFeeForAmount(grid, amount);
  return {
    possible: fee !== null,
    amount,
    fee,
  };
}

type SplitState = { fee: number; operations: Operation[] };

/**
 * Calcule, par programmation dynamique mémoïsée, la meilleure décomposition
 * de `target` en une somme de sommets de palier (+ un reliquat direct) qui
 * minimise le total des frais MVola.
 *
 * Implémentation itérative (pile explicite, pas de récursion native) pour
 * ne jamais risquer de dépassement de pile d'appel, même sur de gros
 * montants. Comme tous les sommets de palier sont des multiples de 1 000 Ar,
 * tous les montants intermédiaires rencontrés partagent le même reste
 * modulo 1 000 que `target` : le nombre d'états distincts est donc borné par
 * `target / 1 000` (~20 000 états au maximum pour 20 000 000 Ar), ce qui
 * reste largement gérable en performance.
 */
function bestDecomposition(grid: FeeGrid, target: number): SplitState {
  const min = gridMin(grid);
  const breakpoints = splitBreakpoints(grid);
  const memo = new Map<number, SplitState>();
  const stack: number[] = [target];

  while (stack.length > 0) {
    const amount = stack[stack.length - 1];

    if (amount <= 0) {
      memo.set(amount, { fee: 0, operations: [] });
      stack.pop();
      continue;
    }
    if (memo.has(amount)) {
      stack.pop();
      continue;
    }

    const candidates = breakpoints.filter((bp) => bp <= amount);
    const missing = candidates
      .map((bp) => amount - bp)
      .filter((rest) => rest > 0 && !memo.has(rest));

    if (missing.length > 0) {
      // Les dépendances (montants restants) ne sont pas encore résolues :
      // on les empile et on retraite `amount` une fois qu'elles le seront.
      for (const rest of missing) stack.push(rest);
      continue;
    }

    // Cas de base : effectuer tout `amount` en une seule fois (si couvert par le barème).
    let bestFee = Infinity;
    let bestOperations: Operation[] = [];
    const isUnsplittableRemainder = amount !== target && amount < min;
    const directFee = isUnsplittableRemainder ? null : getFeeForAmount(grid, amount);
    if (directFee !== null) {
      bestFee = directFee;
      bestOperations = [{ amount, fee: directFee }];
    }

    // Cas récursif : prélever un sommet de palier puis compléter avec le reste optimal.
    for (const bp of candidates) {
      const chunkFee = getFeeForAmount(grid, bp)!;
      const rest = amount - bp;
      const restResult = rest > 0 ? memo.get(rest)! : { fee: 0, operations: [] };
      const totalFee = chunkFee + restResult.fee;
      if (totalFee < bestFee) {
        bestFee = totalFee;
        bestOperations = [{ amount: bp, fee: chunkFee }, ...restResult.operations];
      }
    }

    memo.set(amount, { fee: bestFee, operations: bestOperations });
    stack.pop();
  }

  return memo.get(target)!;
}

/**
 * Recherche, parmi toutes les décompositions possibles en sommets de palier
 * de la grille (+ un reliquat), celle qui minimise la somme des frais MVola
 * pour `amount`.
 */
export function calculateOptimizedSplit(grid: FeeGrid, amount: number): OptimizedResult {
  if (amount <= 0) {
    return { operations: [], totalFee: 0, totalAmount: 0 };
  }

  const { fee, operations } = bestDecomposition(grid, amount);

  if (!Number.isFinite(fee)) {
    // Aucune décomposition valide trouvée (ne devrait pas arriver en
    // pratique grâce au chaînage d'opérations au sommet le plus haut).
    return { operations: [], totalFee: 0, totalAmount: 0 };
  }

  return {
    operations,
    totalFee: fee,
    totalAmount: operations.reduce((sum, op) => sum + op.amount, 0),
  };
}

/** Compare l'option directe et l'option optimisée pour un montant et une grille donnés. */
export function calculateMvolaFees(grid: FeeGrid, amount: number): CalculationResult {
  const direct = calculateDirect(grid, amount);
  const optimized = calculateOptimizedSplit(grid, amount);

  const directFee = direct.possible ? (direct.fee ?? 0) : Infinity;
  const savings = direct.possible ? Math.max(0, directFee - optimized.totalFee) : 0;

  return { amount, direct, optimized, savings };
}
