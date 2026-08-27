import type { DirectResult } from '../types/mvola';
import { formatAriary } from '../utils/format';

interface DirectOptionCardProps {
  direct: DirectResult;
}

export function DirectOptionCard({ direct }: DirectOptionCardProps) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border-2 border-slate-800 bg-slate-900 p-6">
      <span className="mb-4 inline-flex w-fit items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
        Retrait direct
      </span>

      <p className="text-sm text-slate-400">Retirer en une seule fois</p>
      <p className="mt-1 text-3xl font-bold text-white">{formatAriary(direct.amount)}</p>

      <div className="mt-6 border-t border-slate-800 pt-4">
        {direct.possible ? (
          <>
            <p className="text-sm text-slate-400">Frais appliqués</p>
            <p className="text-2xl font-bold text-rose-500">{formatAriary(direct.fee ?? 0)}</p>
          </>
        ) : (
          <p className="text-sm font-medium text-rose-500">
            Retrait impossible en une seule transaction (plafond dépassé).
          </p>
        )}
      </div>
    </div>
  );
}
