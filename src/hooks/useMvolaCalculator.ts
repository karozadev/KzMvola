import { useCallback, useMemo, useState } from 'react';
import type { CalculationResult } from '../types/mvola';
import {
  MODES,
  TRANSFER_DESTINATIONS,
  resolveOperation,
  type Mode,
  type OperationConfig,
  type TransferDestination,
} from '../utils/feeGrids';
import { calculateMvolaFees, gridMax } from '../utils/mvolaFeeCalculator';
import { formatNumber, parseAmountInput } from '../utils/format';

interface InitialState {
  mode: Mode;
  destination: TransferDestination;
  amount: number;
}

/** Lit l'état initial depuis l'URL : `?mode=`, `?destination=`, `?montant=`. */
function readInitialState(): InitialState {
  if (typeof window === 'undefined') {
    return { mode: 'retrait', destination: 'mvola', amount: 0 };
  }
  const params = new URLSearchParams(window.location.search);
  const rawMode = params.get('mode');
  const rawDestination = params.get('destination');
  return {
    mode: MODES.includes(rawMode as Mode) ? (rawMode as Mode) : 'retrait',
    destination: TRANSFER_DESTINATIONS.includes(rawDestination as TransferDestination)
      ? (rawDestination as TransferDestination)
      : 'mvola',
    amount: parseAmountInput(params.get('montant') ?? ''),
  };
}

/** Reflète le mode / la destination dans l'URL (lien partageable, captures). */
function syncUrl(mode: Mode, destination: TransferDestination): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (mode === 'retrait') {
    params.delete('mode');
    params.delete('destination');
  } else {
    params.set('mode', 'transfert');
    params.set('destination', destination);
  }
  const qs = params.toString();
  window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

export interface UseMvolaCalculator {
  mode: Mode;
  destination: TransferDestination;
  setMode: (mode: Mode) => void;
  setDestination: (destination: TransferDestination) => void;
  config: OperationConfig;
  rawInput: string;
  amount: number;
  result: CalculationResult | null;
  isOverLimit: boolean;
  maxAmount: number;
  handleAmountChange: (raw: string) => void;
  reset: () => void;
}

/**
 * Gère le mode d'opération (retrait / transfert), la destination et la saisie
 * du montant, puis déclenche le calcul d'optimisation MVola correspondant.
 */
export function useMvolaCalculator(): UseMvolaCalculator {
  const initial = useMemo(() => readInitialState(), []);
  const [mode, setModeState] = useState<Mode>(initial.mode);
  const [destination, setDestinationState] = useState<TransferDestination>(initial.destination);
  const [amount, setAmount] = useState(initial.amount);
  const [rawInput, setRawInput] = useState(() =>
    initial.amount > 0 ? formatNumber(initial.amount) : '',
  );

  const config = useMemo(() => resolveOperation(mode, destination), [mode, destination]);
  const maxAmount = gridMax(config.grid);
  const isOverLimit = amount > maxAmount;

  const handleAmountChange = (raw: string) => {
    const parsed = parseAmountInput(raw);
    setAmount(parsed);
    setRawInput(parsed > 0 ? formatNumber(parsed) : '');
  };

  const reset = () => {
    setAmount(0);
    setRawInput('');
  };

  const setMode = useCallback(
    (next: Mode) => {
      setModeState(next);
      syncUrl(next, destination);
    },
    [destination],
  );

  const setDestination = useCallback((next: TransferDestination) => {
    setDestinationState(next);
    syncUrl('transfert', next);
  }, []);

  const result = useMemo(() => {
    if (amount <= 0 || isOverLimit) return null;
    return calculateMvolaFees(config.grid, amount);
  }, [config.grid, amount, isOverLimit]);

  return {
    mode,
    destination,
    setMode,
    setDestination,
    config,
    rawInput,
    amount,
    result,
    isOverLimit,
    maxAmount,
    handleAmountChange,
    reset,
  };
}
