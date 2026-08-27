import { useEffect, useRef, type ChangeEvent } from 'react';
import { MAX_AMOUNT } from '../utils/mvolaFeeCalculator';
import { countDigitsBeforeIndex, cursorPositionAfterDigits, formatAriary } from '../utils/format';

interface CalculatorFormProps {
  rawInput: string;
  isOverLimit: boolean;
  onAmountChange: (raw: string) => void;
}

export function CalculatorForm({ rawInput, isOverLimit, onAmountChange }: CalculatorFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDigitCountRef = useRef<number | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    pendingDigitCountRef.current = countDigitsBeforeIndex(value, selectionStart ?? value.length);
    onAmountChange(value);
  };

  useEffect(() => {
    if (pendingDigitCountRef.current === null || !inputRef.current) return;
    const position = cursorPositionAfterDigits(rawInput, pendingDigitCountRef.current);
    inputRef.current.setSelectionRange(position, position);
    pendingDigitCountRef.current = null;
  }, [rawInput]);

  return (
    <div className="w-full">
      <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-400">
        Montant total à retirer
      </label>
      <div className="flex w-full items-center rounded-2xl border-2 border-slate-800 bg-slate-900 px-5 py-4 focus-within:border-amber-400">
        <input
          ref={inputRef}
          id="amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex : 265 000"
          value={rawInput}
          onChange={handleChange}
          className="w-full min-w-0 bg-transparent text-2xl font-semibold text-white placeholder:text-slate-600 outline-none"
        />
        <span className="ml-2 shrink-0 text-2xl font-semibold text-slate-500">Ar</span>
      </div>
      {isOverLimit && (
        <p className="mt-2 text-sm font-medium text-rose-500">
          Montant maximum géré par la grille tarifaire : {formatAriary(MAX_AMOUNT)}.
        </p>
      )}
    </div>
  );
}
