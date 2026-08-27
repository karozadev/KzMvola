import { describe, expect, it } from 'vitest';
import {
  DESTINATION_LABELS,
  MODES,
  TRANSFER_DESTINATIONS,
  resolveOperation,
} from './feeGrids';
import { gridMax } from './mvolaFeeCalculator';

describe('resolveOperation', () => {
  it('renvoie la grille retrait et les formulations de retrait', () => {
    const config = resolveOperation('retrait', 'mvola');
    expect(config.grid.id).toBe('retrait');
    expect(config.wording.amountLabel).toMatch(/retirer/i);
    expect(config.wording.itemNoun).toBe('Retrait');
    expect(gridMax(config.grid)).toBe(20_000_000);
  });

  it('sélectionne la grille de transfert selon la destination', () => {
    expect(resolveOperation('transfert', 'mvola').grid.id).toBe('transfert-mvola');
    expect(resolveOperation('transfert', 'autre-operateur').grid.id).toBe(
      'transfert-autre-operateur',
    );
    expect(resolveOperation('transfert', 'non-abonne').grid.id).toBe('transfert-non-abonne');
  });

  it('utilise les formulations de transfert quel que soit le destinataire', () => {
    for (const destination of TRANSFER_DESTINATIONS) {
      const config = resolveOperation('transfert', destination);
      expect(config.wording.amountLabel).toMatch(/transférer/i);
      expect(config.wording.itemNoun).toBe('Envoi');
      expect(config.gridCaption).toContain(DESTINATION_LABELS[destination]);
    }
  });

  it('plafonne les transferts hors abonné MVola à 5 000 000 Ar', () => {
    expect(gridMax(resolveOperation('transfert', 'autre-operateur').grid)).toBe(5_000_000);
    expect(gridMax(resolveOperation('transfert', 'non-abonne').grid)).toBe(5_000_000);
    expect(gridMax(resolveOperation('transfert', 'mvola').grid)).toBe(20_000_000);
  });

  it('expose exactement deux modes', () => {
    expect(MODES).toEqual(['retrait', 'transfert']);
  });
});
