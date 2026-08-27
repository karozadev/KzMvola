import { describe, expect, it } from 'vitest';
import type { FeeGrid } from '../types/mvola';
import { FEE_GRIDS } from './feeGrids';
import {
  calculateDirect,
  calculateMvolaFees,
  calculateOptimizedSplit,
  getFeeForAmount,
  gridMax,
  gridMin,
} from './mvolaFeeCalculator';

const RETRAIT = FEE_GRIDS.retrait;
const TRANSFERT_MVOLA = FEE_GRIDS['transfert-mvola'];
const TRANSFERT_NON_ABONNE = FEE_GRIDS['transfert-non-abonne'];
const ALL_GRIDS: FeeGrid[] = Object.values(FEE_GRIDS);

describe('getFeeForAmount', () => {
  it('ne facture rien en dessous du premier palier', () => {
    for (const grid of ALL_GRIDS) {
      expect(getFeeForAmount(grid, 0)).toBe(0);
      expect(getFeeForAmount(grid, 99)).toBe(0);
    }
  });

  it('applique le frais du palier contenant le montant (retrait)', () => {
    expect(getFeeForAmount(RETRAIT, 1_000)).toBe(100);
    expect(getFeeForAmount(RETRAIT, 10_000)).toBe(275);
    expect(getFeeForAmount(RETRAIT, 265_000)).toBe(4_700);
    expect(getFeeForAmount(RETRAIT, gridMax(RETRAIT))).toBe(100_000);
  });

  it('applique le barème « transfert vers un abonné MVola »', () => {
    expect(getFeeForAmount(TRANSFERT_MVOLA, 5_000)).toBe(70);
    expect(getFeeForAmount(TRANSFERT_MVOLA, 25_000)).toBe(250);
    expect(getFeeForAmount(TRANSFERT_MVOLA, 250_000)).toBe(1_900);
    expect(getFeeForAmount(TRANSFERT_MVOLA, 500_000)).toBe(1_900);
    expect(getFeeForAmount(TRANSFERT_MVOLA, 1_000_000)).toBe(3_200);
    expect(getFeeForAmount(TRANSFERT_MVOLA, 20_000_000)).toBe(31_300);
  });

  it('applique le barème « transfert vers un non-abonné »', () => {
    expect(getFeeForAmount(TRANSFERT_NON_ABONNE, 10_000)).toBe(1_400);
    expect(getFeeForAmount(TRANSFERT_NON_ABONNE, 250_000)).toBe(10_000);
    expect(getFeeForAmount(TRANSFERT_NON_ABONNE, 5_000_000)).toBe(60_000);
  });

  it('renvoie null au-delà du plafond de la grille', () => {
    expect(getFeeForAmount(RETRAIT, gridMax(RETRAIT) + 1)).toBeNull();
    expect(getFeeForAmount(TRANSFERT_NON_ABONNE, 5_000_001)).toBeNull();
  });

  it('est cohérent aux bornes de chaque palier de chaque grille', () => {
    for (const grid of ALL_GRIDS) {
      for (const tier of grid.tiers) {
        expect(getFeeForAmount(grid, tier.min)).toBe(tier.fee);
        expect(getFeeForAmount(grid, tier.max)).toBe(tier.fee);
      }
    }
  });
});

describe('grilles tarifaires', () => {
  it('sont continues, ordonnées et à sommets multiples de 1 000 Ar', () => {
    for (const grid of ALL_GRIDS) {
      expect(gridMin(grid)).toBe(100);
      grid.tiers.forEach((tier, i) => {
        expect(tier.max).toBeGreaterThan(tier.min);
        expect(tier.max % 1_000).toBe(0);
        if (i > 0) expect(tier.min).toBe(grid.tiers[i - 1].max + 1);
      });
    }
  });
});

describe('calculateDirect', () => {
  it('décrit une opération réalisable en une transaction', () => {
    expect(calculateDirect(RETRAIT, 265_000)).toEqual({
      possible: true,
      amount: 265_000,
      fee: 4_700,
    });
  });

  it('marque une opération au-dessus du plafond comme impossible', () => {
    expect(calculateDirect(TRANSFERT_NON_ABONNE, 8_000_000)).toEqual({
      possible: false,
      amount: 8_000_000,
      fee: null,
    });
  });
});

describe('calculateOptimizedSplit', () => {
  it('renvoie une décomposition vide pour un montant nul ou négatif', () => {
    expect(calculateOptimizedSplit(RETRAIT, 0)).toEqual({
      operations: [],
      totalFee: 0,
      totalAmount: 0,
    });
  });

  it('ne fractionne pas quand une opération unique est déjà optimale', () => {
    const result = calculateOptimizedSplit(RETRAIT, 3_000);
    expect(result.operations).toEqual([{ amount: 3_000, fee: 150 }]);
    expect(result.totalFee).toBe(150);
  });

  it('garde des sous-totaux cohérents sur toutes les grilles', () => {
    for (const grid of ALL_GRIDS) {
      for (const amount of [7_500, 42_000, 265_000, 1_234_000, 4_999_999]) {
        const result = calculateOptimizedSplit(grid, amount);
        const feeSum = result.operations.reduce((s, op) => s + op.fee, 0);
        const amountSum = result.operations.reduce((s, op) => s + op.amount, 0);
        expect(feeSum).toBe(result.totalFee);
        expect(amountSum).toBe(result.totalAmount);
        expect(result.totalAmount).toBe(amount);
      }
    }
  });

  it('chaque frais unitaire correspond bien à la grille utilisée', () => {
    for (const op of calculateOptimizedSplit(TRANSFERT_MVOLA, 1_780_000).operations) {
      expect(op.fee).toBe(getFeeForAmount(TRANSFERT_MVOLA, op.amount));
    }
  });

  it("n'émet jamais d'opération sous le minimum de 100 Ar", () => {
    for (const grid of ALL_GRIDS) {
      for (const amount of [100_150, 250_099, 1_000_050]) {
        for (const op of calculateOptimizedSplit(grid, amount).operations) {
          expect(op.amount).toBeGreaterThanOrEqual(gridMin(grid));
        }
      }
    }
  });
});

describe('calculateMvolaFees', () => {
  it("l'optimisation ne coûte jamais plus cher que l'opération directe", () => {
    const largeSamples = [
      500_000, 999_999, 1_500_000, 2_400_001, 4_999_999, 12_345_678, 19_999_999,
    ];
    for (const grid of ALL_GRIDS) {
      const amounts = [];
      for (let a = 500; a <= 320_000; a += 1_111) amounts.push(a);
      for (const a of largeSamples) if (a <= gridMax(grid)) amounts.push(a);

      for (const amount of amounts) {
        const { direct, optimized, savings } = calculateMvolaFees(grid, amount);
        if (direct.possible) {
          expect(optimized.totalFee).toBeLessThanOrEqual(direct.fee ?? 0);
          expect(savings).toBe(Math.max(0, (direct.fee ?? 0) - optimized.totalFee));
        }
        expect(savings).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('expose une économie réelle sur un retrait de 265 000 Ar', () => {
    const result = calculateMvolaFees(RETRAIT, 265_000);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.savings).toBe((result.direct.fee ?? 0) - result.optimized.totalFee);
  });

  it('trouve un fractionnement gagnant pour un transfert « non-abonné » de 300 000 Ar', () => {
    // 300 000 direct = 15 000 ; 250 000 (10 000) + 50 000 (3 800) = 13 800.
    const result = calculateMvolaFees(TRANSFERT_NON_ABONNE, 300_000);
    expect(result.direct.fee).toBe(15_000);
    expect(result.optimized.totalFee).toBeLessThan(15_000);
    expect(result.savings).toBeGreaterThan(0);
  });

  it('au-delà du plafond : opération directe impossible, aucune économie', () => {
    const result = calculateMvolaFees(TRANSFERT_NON_ABONNE, 8_000_000);
    expect(result.direct.possible).toBe(false);
    expect(result.savings).toBe(0);
  });
});
