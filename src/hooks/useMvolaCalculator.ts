import { useMemo, useState } from 'react';
import type { CalculationResult } from '../types/mvola';
import { MAX_AMOUNT, calculateMvolaFees } from '../utils/mvolaFeeCalculator';
import { formatNumber, parseAmountInput } from '../utils/format';

export interface UseMvolaCalculator {
  rawInput: string;
  amount: number;
  result: CalculationResult | null;
  isOverLimit: boolean;
  handleAmountChange: (raw: string) => void;
  reset: () => void;
}

/** Gère l'état de saisie du montant et déclenche le calcul d'optimisation MVola à chaque changement. */
export function useMvolaCalculator(): UseMvolaCalculator {
  const [amount, setAmount] = useState(0);
  const [rawInput, setRawInput] = useState('');

  const handleAmountChange = (raw: string) => {
    const parsed = parseAmountInput(raw);
    setAmount(parsed);
    setRawInput(parsed > 0 ? formatNumber(parsed) : '');
  };

  const reset = () => {
    setAmount(0);
    setRawInput('');
  };

  const isOverLimit = amount > MAX_AMOUNT;

  const result = useMemo(() => {
    if (amount <= 0 || isOverLimit) return null;
    return calculateMvolaFees(amount);
  }, [amount, isOverLimit]);

  return { rawInput, amount, result, isOverLimit, handleAmountChange, reset };
}
