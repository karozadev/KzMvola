import type { OptimizedResult } from '../types/mvola';
import { formatAriary } from '../utils/format';

interface OptimizedOptionCardProps {
  optimized: OptimizedResult;
  savings: number;
}

export function OptimizedOptionCard({ optimized, savings }: OptimizedOptionCardProps) {
  const hasSplit = optimized.withdrawals.length > 1;

  return (
    <div className="relative flex flex-1 flex-col rounded-2xl border-2 border-emerald-500 bg-slate-900 p-6">
      <span className="mb-4 inline-flex w-fit items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-950">
        {hasSplit ? 'Optimisé · Recommandé' : 'Optimal'}
      </span>

      <p className="text-sm text-slate-400">
        {hasSplit
          ? `Retrait fractionné en ${optimized.withdrawals.length} opérations`
          : 'Aucun fractionnement nécessaire'}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {optimized.withdrawals.map((withdrawal, index) => (
          <li
            key={`${withdrawal.amount}-${index}`}
            className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm"
          >
            <span className="text-slate-300">
              Retrait {index + 1} : {formatAriary(withdrawal.amount)}
            </span>
            <span className="font-semibold text-white">{formatAriary(withdrawal.fee)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-sm text-slate-400">Total des frais</p>
        <p className="text-2xl font-bold text-white">{formatAriary(optimized.totalFee)}</p>
      </div>

      {savings > 0 && (
        <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950">
          Économie : {formatAriary(savings)}
        </div>
      )}
    </div>
  );
}
