import {
  DESTINATION_LABELS,
  MODES,
  MODE_LABELS,
  TRANSFER_DESTINATIONS,
  type Mode,
  type TransferDestination,
} from '../utils/feeGrids';

interface ModeTabsProps {
  mode: Mode;
  destination: TransferDestination;
  onModeChange: (mode: Mode) => void;
  onDestinationChange: (destination: TransferDestination) => void;
}

export function ModeTabs({ mode, destination, onModeChange, onDestinationChange }: ModeTabsProps) {
  return (
    <div className="md:max-w-xl">
      <div
        role="tablist"
        aria-label="Type d'opération"
        className="flex border border-nfx-border bg-nfx-panel"
      >
        {MODES.map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onModeChange(m)}
              className={`flex-1 px-4 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] transition-colors ${
                active
                  ? 'bg-nfx-red text-nfx-white'
                  : 'text-nfx-grey hover:text-nfx-white'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          );
        })}
      </div>

      {mode === 'transfert' && (
        <div className="mt-2 flex flex-wrap gap-2">
          {TRANSFER_DESTINATIONS.map((d) => {
            const active = d === destination;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDestinationChange(d)}
                aria-pressed={active}
                className={`border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                  active
                    ? 'border-nfx-green bg-nfx-green/10 text-nfx-green'
                    : 'border-nfx-border text-nfx-grey hover:text-nfx-white'
                }`}
              >
                {DESTINATION_LABELS[d]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
