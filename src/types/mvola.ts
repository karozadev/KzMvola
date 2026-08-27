/** Un palier de la grille tarifaire officielle MVola (Cash Point). */
export interface FeeTier {
  min: number;
  max: number;
  fee: number;
}

/** Un retrait unitaire au sein d'une décomposition (montant + frais associé). */
export interface Withdrawal {
  amount: number;
  fee: number;
}

/** Résultat du calcul pour un retrait effectué en une seule transaction. */
export interface DirectResult {
  possible: boolean;
  amount: number;
  fee: number | null;
}

/** Résultat du calcul pour la meilleure décomposition trouvée en plusieurs retraits. */
export interface OptimizedResult {
  withdrawals: Withdrawal[];
  totalFee: number;
  totalWithdrawn: number;
}

/** Résultat global combinant l'option directe, l'option optimisée et l'économie réalisée. */
export interface CalculationResult {
  amount: number;
  direct: DirectResult;
  optimized: OptimizedResult;
  savings: number;
}
