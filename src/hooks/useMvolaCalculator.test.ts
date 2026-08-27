import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { formatNumber } from '../utils/format';
import { MAX_AMOUNT } from '../utils/mvolaFeeCalculator';
import { useMvolaCalculator } from './useMvolaCalculator';

describe('useMvolaCalculator', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it("part d'un état vide sans résultat", () => {
    const { result } = renderHook(() => useMvolaCalculator());
    expect(result.current.rawInput).toBe('');
    expect(result.current.amount).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.isOverLimit).toBe(false);
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

  it('signale un dépassement de plafond et supprime le résultat', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange(String(MAX_AMOUNT + 1)));

    expect(result.current.isOverLimit).toBe(true);
    expect(result.current.result).toBeNull();
  });

  it('initialise le montant depuis le paramètre ?montant= de l\'URL', () => {
    window.history.replaceState({}, '', '/?montant=265000');
    const { result } = renderHook(() => useMvolaCalculator());

    expect(result.current.amount).toBe(265_000);
    expect(result.current.rawInput).toBe(formatNumber(265_000));
    expect(result.current.result?.direct.fee).toBe(4_700);
  });

  it('remet à zéro via reset', () => {
    const { result } = renderHook(() => useMvolaCalculator());

    act(() => result.current.handleAmountChange('42000'));
    act(() => result.current.reset());

    expect(result.current.rawInput).toBe('');
    expect(result.current.amount).toBe(0);
    expect(result.current.result).toBeNull();
  });
});
