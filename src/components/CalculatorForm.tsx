import { useEffect, useRef, type ChangeEvent } from 'react';
import { countDigitsBeforeIndex, cursorPositionAfterDigits, formatAriary } from '../utils/format';

interface CalculatorFormProps {
  rawInput: string;
  isOverLimit: boolean;
  maxAmount: number;
  label: string;
  onAmountChange: (raw: string) => void;
}

export function CalculatorForm({
  rawInput,
  isOverLimit,
  maxAmount,
  label,
  onAmountChange,
}: CalculatorFormProps) {
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
    <div className="w-full md:max-w-xl">
      <label
        htmlFor="amount"
        className="mb-2.5 mt-6 block text-[11px] font-bold uppercase tracking-[0.1em] text-nfx-grey"
      >
        {label}
      </label>
      <div className="flex w-full items-center border border-nfx-border border-l-[3px] border-l-nfx-red bg-nfx-panel px-4 py-4">
        <input
          ref={inputRef}
          id="amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex : 265 000"
          value={rawInput}
          onChange={handleChange}
          className="w-full min-w-0 bg-transparent font-mono text-[22px] font-bold text-nfx-white placeholder:text-nfx-grey/40 outline-none"
        />
        <span className="ml-2 shrink-0 font-mono text-sm font-semibold text-nfx-grey">Ar</span>
      </div>
      {isOverLimit && (
        <p className="mt-2 text-sm font-medium text-nfx-red">
          Montant maximum géré par cette grille tarifaire : {formatAriary(maxAmount)}.
        </p>
      )}
    </div>
  );
}
