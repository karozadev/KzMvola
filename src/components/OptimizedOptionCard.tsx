import type { DirectResult, OptimizedResult } from '../types/mvola';
import { formatAriary } from '../utils/format';

interface OptimizedOptionCardProps {
  optimized: OptimizedResult;
  direct: DirectResult;
  savings: number;
}

export function OptimizedOptionCard({ optimized, direct, savings }: OptimizedOptionCardProps) {
  const hasSplit = optimized.withdrawals.length > 1;
  const directFee = direct.possible ? (direct.fee ?? 0) : 0;
  const savedPct = directFee > 0 ? Math.round((savings / directFee) * 100) : 0;

  return (
    <div className="border border-nfx-border bg-nfx-panel">
      <div className="flex items-center justify-between border-b border-nfx-border bg-nfx-raised px-[18px] py-3.5">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-nfx-grey">
          Retrait fractionné
        </span>
        <span className="text-[13px] font-extrabold text-nfx-green">
          {hasSplit && savedPct > 0 ? `${savedPct}% de frais en moins` : 'Optimal'}
        </span>
      </div>

      <div className="p-[18px]">
        <p className="mb-1 text-[13px] text-nfx-grey">
          {hasSplit
            ? `Retrait fractionné en ${optimized.withdrawals.length} opérations`
            : 'Aucun fractionnement nécessaire'}
        </p>

        {optimized.withdrawals.map((withdrawal, index) => (
          <div
            key={`${withdrawal.amount}-${index}`}
            className="flex items-baseline justify-between border-b border-dashed border-nfx-border py-2 text-sm text-nfx-grey last:border-b-0"
          >
            <span>
              Retrait {index + 1} · {formatAriary(withdrawal.amount)}
            </span>
            <span className="font-mono font-semibold text-nfx-white">
              {formatAriary(withdrawal.fee)}
            </span>
          </div>
        ))}

        <div className="my-3 border-t border-nfx-border" />

        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold uppercase tracking-[0.04em] text-nfx-white">
            Total des frais
          </span>
          <span className="font-mono text-[22px] font-extrabold text-nfx-green">
            {formatAriary(optimized.totalFee)}
          </span>
        </div>

        {savings > 0 && (
          <div className="mt-4 flex items-center gap-2 border-l-[3px] border-nfx-green bg-nfx-green/10 px-3.5 py-2.5">
            <span className="font-display text-base text-nfx-green">−{formatAriary(savings)}</span>
            <span className="text-[12.5px] font-semibold text-nfx-grey">
              économisés vs. retrait direct
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
