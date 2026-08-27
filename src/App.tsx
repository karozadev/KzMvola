import { CalculatorForm } from './components/CalculatorForm';
import { DirectOptionCard } from './components/DirectOptionCard';
import { ModeTabs } from './components/ModeTabs';
import { OptimizedOptionCard } from './components/OptimizedOptionCard';
import { useMvolaCalculator } from './hooks/useMvolaCalculator';
import { OFFICIAL_TARIFF_URL } from './utils/feeGrids';

function App() {
  const {
    mode,
    destination,
    setMode,
    setDestination,
    config,
    rawInput,
    result,
    isOverLimit,
    maxAmount,
    handleAmountChange,
  } = useMvolaCalculator();

  return (
    <div className="min-h-screen bg-nfx-black text-nfx-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col md:max-w-4xl lg:max-w-5xl">
        <div className="nfx-topfade flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
          <span className="font-display text-[22px] tracking-tight text-nfx-red md:text-[26px]">
            KZ
          </span>
          <span className="text-[11px] tracking-wide text-nfx-grey md:text-xs">
            mvola.karoza.dev
          </span>
        </div>

        <header className="nfx-hero-glow px-5 pb-8 pt-6 md:px-10 md:pb-10 md:pt-12">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-nfx-red px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-nfx-white">
              Top frais
            </span>
            <span className="border border-nfx-grey px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-nfx-grey">
              Grille 2026
            </span>
          </div>
          <h1 className="font-display text-[27px] uppercase leading-[1.12] tracking-[-0.01em] md:text-[40px] lg:text-[48px]">
            Optimiseur de frais MVola
          </h1>
          <p className="mt-3 max-w-[46ch] text-[14.5px] leading-[1.55] text-nfx-grey md:mt-4 md:text-base">
            {config.heroSubtitle}
          </p>
        </header>

        <main className="px-5 md:px-10">
          <ModeTabs
            mode={mode}
            destination={destination}
            onModeChange={setMode}
            onDestinationChange={setDestination}
          />

          <CalculatorForm
            rawInput={rawInput}
            isOverLimit={isOverLimit}
            maxAmount={maxAmount}
            label={config.wording.amountLabel}
            onAmountChange={handleAmountChange}
          />

          {result && (
            <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:items-start">
              <DirectOptionCard direct={result.direct} wording={config.wording} />
              <OptimizedOptionCard
                optimized={result.optimized}
                direct={result.direct}
                savings={result.savings}
                wording={config.wording}
              />
            </div>
          )}

          {!result && !isOverLimit && (
            <p className="mt-6 text-center text-sm text-nfx-grey/60">
              Saisissez un montant pour voir la meilleure stratégie.
            </p>
          )}
        </main>

        <footer className="mt-auto px-5 pb-8 pt-10 text-center text-[11.5px] leading-[1.8] text-white/30 md:px-10 md:pb-10 md:pt-16">
          {config.gridCaption}
          <br />
          Tarif officiel :{' '}
          <a
            href={OFFICIAL_TARIFF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/45 underline hover:text-nfx-red"
          >
            mvola.mg/tarifs
          </a>
          <br />
          Développé par{' '}
          <a
            href="https://stephanot.karoza.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-nfx-red hover:underline"
          >
            Stephanot Zafindratafa
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
