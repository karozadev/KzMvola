/** Un palier d'une grille tarifaire officielle MVola. */
export interface FeeTier {
  min: number;
  max: number;
  fee: number;
}

/** Une grille tarifaire (barème) : une liste ordonnée de paliers. */
export interface FeeGrid {
  /** Identifiant stable, utilisé notamment dans l'URL. */
  id: string;
  tiers: FeeTier[];
}

/** Une opération unitaire au sein d'une décomposition (montant + frais associé). */
export interface Operation {
  amount: number;
  fee: number;
}

/** Résultat du calcul pour une opération effectuée en une seule transaction. */
export interface DirectResult {
  possible: boolean;
  amount: number;
  fee: number | null;
}

/** Résultat du calcul pour la meilleure décomposition trouvée en plusieurs opérations. */
export interface OptimizedResult {
  operations: Operation[];
  totalFee: number;
  totalAmount: number;
}

/** Résultat global combinant l'option directe, l'option optimisée et l'économie réalisée. */
export interface CalculationResult {
  amount: number;
  direct: DirectResult;
  optimized: OptimizedResult;
  savings: number;
}
