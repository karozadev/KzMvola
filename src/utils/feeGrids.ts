import type { FeeGrid, FeeTier } from '../types/mvola';

/**
 * Toutes les grilles proviennent du tarif officiel MVola publié sur
 * https://www.mvola.mg/tarifs/ (barème « Cash Point » pour le retrait,
 * barème « Transfert d'argent » pour les transferts).
 */
export const OFFICIAL_TARIFF_URL = 'https://www.mvola.mg/tarifs/';

// --- Retrait (Cash Point), de 100 à 20 000 000 Ar --------------------------

const WITHDRAWAL_TIERS: FeeTier[] = [
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

// --- Transfert vers un abonné MVola, de 100 à 20 000 000 Ar ----------------

const TRANSFER_MVOLA_TIERS: FeeTier[] = [
  { min: 100, max: 1_000, fee: 70 },
  { min: 1_001, max: 5_000, fee: 70 },
  { min: 5_001, max: 10_000, fee: 150 },
  { min: 10_001, max: 25_000, fee: 250 },
  { min: 25_001, max: 50_000, fee: 500 },
  { min: 50_001, max: 100_000, fee: 1_000 },
  { min: 100_001, max: 250_000, fee: 1_900 },
  { min: 250_001, max: 500_000, fee: 1_900 },
  { min: 500_001, max: 1_000_000, fee: 3_200 },
  { min: 1_000_001, max: 2_000_000, fee: 3_800 },
  { min: 2_000_001, max: 3_000_000, fee: 5_000 },
  { min: 3_000_001, max: 4_000_000, fee: 6_300 },
  { min: 4_000_001, max: 5_000_000, fee: 7_500 },
  { min: 5_000_001, max: 6_000_000, fee: 9_400 },
  { min: 6_000_001, max: 7_000_000, fee: 10_700 },
  { min: 7_000_001, max: 8_000_000, fee: 12_500 },
  { min: 8_000_001, max: 9_000_000, fee: 14_400 },
  { min: 9_000_001, max: 10_000_000, fee: 15_700 },
  { min: 10_000_001, max: 11_000_000, fee: 17_500 },
  { min: 11_000_001, max: 12_000_000, fee: 18_800 },
  { min: 12_000_001, max: 13_000_000, fee: 20_000 },
  { min: 13_000_001, max: 14_000_000, fee: 21_300 },
  { min: 14_000_001, max: 15_000_000, fee: 23_200 },
  { min: 15_000_001, max: 16_000_000, fee: 25_000 },
  { min: 16_000_001, max: 17_000_000, fee: 26_300 },
  { min: 17_000_001, max: 18_000_000, fee: 28_200 },
  { min: 18_000_001, max: 19_000_000, fee: 30_000 },
  { min: 19_000_001, max: 20_000_000, fee: 31_300 },
];

// --- Transfert vers/depuis un autre opérateur Mobile Money, jusqu'à 5 M ----

const TRANSFER_OTHER_OPERATOR_TIERS: FeeTier[] = [
  { min: 100, max: 1_000, fee: 200 },
  { min: 1_001, max: 5_000, fee: 250 },
  { min: 5_001, max: 10_000, fee: 500 },
  { min: 10_001, max: 25_000, fee: 1_000 },
  { min: 25_001, max: 50_000, fee: 1_500 },
  { min: 50_001, max: 100_000, fee: 2_000 },
  { min: 100_001, max: 250_000, fee: 3_500 },
  { min: 250_001, max: 500_000, fee: 5_000 },
  { min: 500_001, max: 1_000_000, fee: 8_500 },
  { min: 1_000_001, max: 2_000_000, fee: 12_000 },
  { min: 2_000_001, max: 3_000_000, fee: 14_500 },
  { min: 3_000_001, max: 4_000_000, fee: 19_500 },
  { min: 4_000_001, max: 5_000_000, fee: 24_000 },
];

// --- Transfert vers un non-abonné Mobile Money, jusqu'à 5 M ----------------

const TRANSFER_NON_SUBSCRIBER_TIERS: FeeTier[] = [
  { min: 100, max: 1_000, fee: 750 },
  { min: 1_001, max: 5_000, fee: 750 },
  { min: 5_001, max: 10_000, fee: 1_400 },
  { min: 10_001, max: 25_000, fee: 1_800 },
  { min: 25_001, max: 50_000, fee: 3_800 },
  { min: 50_001, max: 100_000, fee: 4_800 },
  { min: 100_001, max: 250_000, fee: 10_000 },
  { min: 250_001, max: 500_000, fee: 15_000 },
  { min: 500_001, max: 1_000_000, fee: 20_000 },
  { min: 1_000_001, max: 2_000_000, fee: 30_000 },
  { min: 2_000_001, max: 3_000_000, fee: 40_000 },
  { min: 3_000_001, max: 4_000_000, fee: 50_000 },
  { min: 4_000_001, max: 5_000_000, fee: 60_000 },
];

// --- Modes et destinations -----------------------------------------------

export type Mode = 'retrait' | 'transfert';
export type TransferDestination = 'mvola' | 'autre-operateur' | 'non-abonne';

export const MODES: Mode[] = ['retrait', 'transfert'];
export const TRANSFER_DESTINATIONS: TransferDestination[] = [
  'mvola',
  'autre-operateur',
  'non-abonne',
];

/** Libellés courts des onglets de mode. */
export const MODE_LABELS: Record<Mode, string> = {
  retrait: 'Retrait',
  transfert: 'Transfert',
};

/** Libellés des destinations de transfert (sélecteur + README). */
export const DESTINATION_LABELS: Record<TransferDestination, string> = {
  mvola: 'Vers un abonné MVola',
  'autre-operateur': 'Vers/depuis un autre opérateur',
  'non-abonne': 'Vers un non-abonné Mobile Money',
};

/** Formulations qui varient selon le type d'opération affiché. */
export interface OperationWording {
  /** Étiquette du champ de saisie. */
  amountLabel: string;
  /** Badge de la carte « option directe ». */
  directBadge: string;
  /** Badge de la carte « option fractionnée ». */
  splitBadge: string;
  /** Ligne décrivant l'opération en une fois. */
  onceLine: string;
  /** Préfixe de chaque ligne de la décomposition (« Retrait 1 · … »). */
  itemNoun: string;
  /** Phrase indiquant le nombre d'opérations de la décomposition. */
  splitCount: (n: number) => string;
  /** Message affiché quand le montant dépasse le plafond. */
  impossible: string;
  /** Suffixe de la bannière d'économie. */
  savingsSuffix: string;
}

const RETRAIT_WORDING: OperationWording = {
  amountLabel: 'Montant total à retirer',
  directBadge: 'Retrait direct',
  splitBadge: 'Retrait fractionné',
  onceLine: 'Retirer en une fois',
  itemNoun: 'Retrait',
  splitCount: (n) => `Retrait fractionné en ${n} opérations`,
  impossible: 'Retrait impossible en une seule transaction (plafond dépassé).',
  savingsSuffix: 'économisés vs. retrait direct',
};

const TRANSFERT_WORDING: OperationWording = {
  amountLabel: 'Montant total à transférer',
  directBadge: 'Transfert direct',
  splitBadge: 'Transfert fractionné',
  onceLine: 'Envoyer en une fois',
  itemNoun: 'Envoi',
  splitCount: (n) => `Transfert fractionné en ${n} envois`,
  impossible: 'Transfert impossible en une seule transaction (plafond dépassé).',
  savingsSuffix: 'économisés vs. transfert direct',
};

export interface OperationConfig {
  grid: FeeGrid;
  wording: OperationWording;
  /** Sous-titre affiché dans l'en-tête. */
  heroSubtitle: string;
  /** Précision affichée sous les cartes / dans le pied de page. */
  gridCaption: string;
}

const GRIDS: Record<string, FeeGrid> = {
  retrait: { id: 'retrait', tiers: WITHDRAWAL_TIERS },
  'transfert-mvola': { id: 'transfert-mvola', tiers: TRANSFER_MVOLA_TIERS },
  'transfert-autre-operateur': {
    id: 'transfert-autre-operateur',
    tiers: TRANSFER_OTHER_OPERATOR_TIERS,
  },
  'transfert-non-abonne': {
    id: 'transfert-non-abonne',
    tiers: TRANSFER_NON_SUBSCRIBER_TIERS,
  },
};

const RETRAIT_SUBTITLE =
  'Comparez le retrait direct et le retrait fractionné pour payer le moins de frais possible.';
const TRANSFERT_SUBTITLE =
  'Comparez le transfert direct et le transfert fractionné pour savoir en combien d’envois payer le moins de frais.';

/** Résout la configuration (grille + formulations) pour un mode et une destination. */
export function resolveOperation(mode: Mode, destination: TransferDestination): OperationConfig {
  if (mode === 'retrait') {
    return {
      grid: GRIDS.retrait,
      wording: RETRAIT_WORDING,
      heroSubtitle: RETRAIT_SUBTITLE,
      gridCaption: 'Grille tarifaire MVola Cash Point · Madagascar',
    };
  }
  return {
    grid: GRIDS[`transfert-${destination}`],
    wording: TRANSFERT_WORDING,
    heroSubtitle: TRANSFERT_SUBTITLE,
    gridCaption: `Grille tarifaire MVola Transfert d’argent · ${DESTINATION_LABELS[destination]}`,
  };
}

/** Grilles exposées pour les tests et la documentation. */
export const FEE_GRIDS = GRIDS;
