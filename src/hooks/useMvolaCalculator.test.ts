import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FEE_GRIDS } from '../utils/feeGrids';
import { formatNumber } from '../utils/format';
import { gridMax } from '../utils/mvolaFeeCalculator';
import { useMvolaCalculator } from './useMvolaCalculator';

const RETRAIT_MAX = gridMax(FEE_GRIDS.retrait);

describe('useMvolaCalculator', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it("part d'un état vide, en mode retrait", () => {
    const { result } = renderHook(() => useMvolaCalculator());
    expect(result.current.mode).toBe('retrait');
    expect(result.current.rawInput).toBe('');
    expect(result.current.amount).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.maxAmount).toBe(RETRAIT_MAX);
  });

  it('normalise la saisie et calcule le résultat', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange('265000'));

    // `rawInput` est reformaté avec une espace insécable (U+00A0).
    expect(result.current.rawInput).toBe(formatNumber(265_000));
    expect(result.current.amount).toBe(265_000);
    expect(result.current.result?.direct.fee).toBe(4_700);
    expect(result.current.result?.savings).toBeGreaterThan(0);
  });

  it('recalcule avec le bon barème après changement de mode', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange('25000'));
    expect(result.current.result?.direct.fee).toBe(650); // retrait

    act(() => result.current.setMode('transfert'));
    expect(result.current.mode).toBe('transfert');
    expect(result.current.result?.direct.fee).toBe(250); // transfert vers abonné MVola
    expect(result.current.config.wording.itemNoun).toBe('Envoi');
  });

  it('change de destination de transfert et de plafond', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.setMode('transfert'));
    act(() => result.current.setDestination('non-abonne'));

    expect(result.current.destination).toBe('non-abonne');
    expect(result.current.maxAmount).toBe(5_000_000);
    expect(window.location.search).toContain('mode=transfert');
    expect(window.location.search).toContain('destination=non-abonne');
  });

  it('revenir en mode retrait nettoie l’URL', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.setMode('transfert'));
    act(() => result.current.setMode('retrait'));

    expect(window.location.search).toBe('');
  });

  it('signale un dépassement de plafond et supprime le résultat', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange(String(RETRAIT_MAX + 1)));

    expect(result.current.isOverLimit).toBe(true);
    expect(result.current.result).toBeNull();
  });

  it('initialise mode, destination et montant depuis l’URL', () => {
    window.history.replaceState({}, '', '/?mode=transfert&destination=non-abonne&montant=300000');
    const { result } = renderHook(() => useMvolaCalculator());

    expect(result.current.mode).toBe('transfert');
    expect(result.current.destination).toBe('non-abonne');
    expect(result.current.amount).toBe(300_000);
    expect(result.current.result?.direct.fee).toBe(15_000);
    expect(result.current.result?.savings).toBeGreaterThan(0);
  });

  it('ignore un paramètre ?mode= invalide', () => {
    window.history.replaceState({}, '', '/?mode=n-importe-quoi');
    const { result } = renderHook(() => useMvolaCalculator());
    expect(result.current.mode).toBe('retrait');
  });

  it('remet à zéro le montant via reset', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange('42000'));
    act(() => result.current.reset());

    expect(result.current.rawInput).toBe('');
    expect(result.current.amount).toBe(0);
    expect(result.current.result).toBeNull();
  });
});
