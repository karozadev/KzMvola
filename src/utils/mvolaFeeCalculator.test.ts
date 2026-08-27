import { describe, expect, it } from 'vitest';
import {
  FEE_TIERS,
  MAX_AMOUNT,
  MIN_AMOUNT,
  calculateDirect,
  calculateMvolaFees,
  calculateOptimizedSplit,
  getFeeForAmount,
} from './mvolaFeeCalculator';

describe('getFeeForAmount', () => {
  it('ne facture rien en dessous du premier palier', () => {
    expect(getFeeForAmount(0)).toBe(0);
    expect(getFeeForAmount(50)).toBe(0);
    expect(getFeeForAmount(99)).toBe(0);
  });

  it('applique le frais du palier contenant le montant', () => {
    expect(getFeeForAmount(100)).toBe(100);
    expect(getFeeForAmount(1_000)).toBe(100);
    expect(getFeeForAmount(1_001)).toBe(150);
    expect(getFeeForAmount(5_000)).toBe(150);
    expect(getFeeForAmount(10_000)).toBe(275);
    expect(getFeeForAmount(265_000)).toBe(4_700);
    expect(getFeeForAmount(MAX_AMOUNT)).toBe(100_000);
  });

  it('renvoie null au-delà du plafond de la grille', () => {
    expect(getFeeForAmount(MAX_AMOUNT + 1)).toBeNull();
    expect(getFeeForAmount(25_000_000)).toBeNull();
  });

  it('est cohérent aux bornes de chaque palier', () => {
    for (const tier of FEE_TIERS) {
      expect(getFeeForAmount(tier.min)).toBe(tier.fee);
      expect(getFeeForAmount(tier.max)).toBe(tier.fee);
    }
  });
});

describe('calculateDirect', () => {
  it('décrit un retrait réalisable en une transaction', () => {
    expect(calculateDirect(265_000)).toEqual({
      possible: true,
      amount: 265_000,
      fee: 4_700,
    });
  });

  it('marque un retrait au-dessus du plafond comme impossible', () => {
    expect(calculateDirect(25_000_000)).toEqual({
      possible: false,
      amount: 25_000_000,
      fee: null,
    });
  });
});

describe('calculateOptimizedSplit', () => {
  it('renvoie une décomposition vide pour un montant nul ou négatif', () => {
    expect(calculateOptimizedSplit(0)).toEqual({
      withdrawals: [],
      totalFee: 0,
      totalWithdrawn: 0,
    });
    expect(calculateOptimizedSplit(-1_000)).toEqual({
      withdrawals: [],
      totalFee: 0,
      totalWithdrawn: 0,
    });
  });

  it('ne fractionne pas quand un retrait unique est déjà optimal', () => {
    const result = calculateOptimizedSplit(3_000);
    expect(result.withdrawals).toEqual([{ amount: 3_000, fee: 150 }]);
    expect(result.totalFee).toBe(150);
  });

  it('trouve une décomposition moins chère que le retrait direct sur 265 000 Ar', () => {
    const directFee = getFeeForAmount(265_000)!;
    const result = calculateOptimizedSplit(265_000);
    expect(result.totalFee).toBeLessThan(directFee);
    expect(result.totalWithdrawn).toBe(265_000);
  });

  it('garde des sous-totaux cohérents (somme des frais et des montants)', () => {
    for (const amount of [7_500, 42_000, 265_000, 1_234_000, 9_999_999]) {
      const result = calculateOptimizedSplit(amount);
      const feeSum = result.withdrawals.reduce((s, w) => s + w.fee, 0);
      const amountSum = result.withdrawals.reduce((s, w) => s + w.amount, 0);
      expect(feeSum).toBe(result.totalFee);
      expect(amountSum).toBe(result.totalWithdrawn);
      expect(result.totalWithdrawn).toBe(amount);
    }
  });

  it('chaque frais unitaire correspond bien à la grille tarifaire', () => {
    for (const w of calculateOptimizedSplit(1_780_000).withdrawals) {
      expect(w.fee).toBe(getFeeForAmount(w.amount));
    }
  });

  it("n'émet jamais de retrait sous le minimum de 100 Ar (pas de reliquat interdit)", () => {
    for (const amount of [100_150, 250_099, 5_000_050, 12_345_678]) {
      for (const w of calculateOptimizedSplit(amount).withdrawals) {
        expect(w.amount).toBeGreaterThanOrEqual(MIN_AMOUNT);
      }
    }
  });
});

describe('calculateMvolaFees', () => {
  it("l'optimisation ne coûte jamais plus cher que le retrait direct", () => {
    for (let amount = 500; amount <= 2_000_000; amount += 1_337) {
      const { direct, optimized, savings } = calculateMvolaFees(amount);
      if (direct.possible) {
        expect(optimized.totalFee).toBeLessThanOrEqual(direct.fee ?? 0);
        expect(savings).toBe(Math.max(0, (direct.fee ?? 0) - optimized.totalFee));
      }
      expect(savings).toBeGreaterThanOrEqual(0);
    }
  });

  it('expose une économie réelle sur un montant charnière', () => {
    const result = calculateMvolaFees(265_000);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.savings).toBe((result.direct.fee ?? 0) - result.optimized.totalFee);
  });

  it('au-delà du plafond : retrait direct impossible, aucune économie affichée', () => {
    const result = calculateMvolaFees(MAX_AMOUNT + 500_000);
    expect(result.direct.possible).toBe(false);
    expect(result.savings).toBe(0);
  });
});
