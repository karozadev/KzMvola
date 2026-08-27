import type { DirectResult } from '../types/mvola';
import { formatAriary } from '../utils/format';

interface DirectOptionCardProps {
  direct: DirectResult;
}

export function DirectOptionCard({ direct }: DirectOptionCardProps) {
  return (
    <div className="border border-nfx-border bg-nfx-panel">
      <div className="flex items-center justify-between border-b border-nfx-border bg-nfx-raised px-[18px] py-3.5">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-nfx-grey">
          Retrait direct
        </span>
        <span className="text-[13px] font-extrabold text-nfx-red">
          {direct.possible ? 'Coût élevé' : 'Indisponible'}
        </span>
      </div>

      <div className="p-[18px]">
        {direct.possible ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-[14.5px] text-nfx-grey">Retirer en une fois</span>
              <span className="font-mono text-xl font-bold text-nfx-white">
                {formatAriary(direct.amount)}
              </span>
            </div>

            <div className="my-3 border-t border-nfx-border" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold uppercase tracking-[0.04em] text-nfx-white">
                Frais appliqués
              </span>
              <span className="font-mono text-[22px] font-extrabold text-nfx-red">
                {formatAriary(direct.fee ?? 0)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium text-nfx-red">
            Retrait impossible en une seule transaction (plafond dépassé).
          </p>
        )}
      </div>
    </div>
  );
}
