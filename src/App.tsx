import { CalculatorForm } from './components/CalculatorForm';
import { DirectOptionCard } from './components/DirectOptionCard';
import { OptimizedOptionCard } from './components/OptimizedOptionCard';
import { useMvolaCalculator } from './hooks/useMvolaCalculator';

function App() {
  const { rawInput, result, isOverLimit, handleAmountChange } = useMvolaCalculator();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-4 py-2">
            <span className="text-lg font-black tracking-tight text-slate-950">KzMvola</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Optimiseur de frais de retrait MVola</h1>
          <p className="mt-2 text-slate-400">
            Comparez le retrait direct et le retrait fractionné pour payer le moins de frais
            possible.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <CalculatorForm
            rawInput={rawInput}
            isOverLimit={isOverLimit}
            onAmountChange={handleAmountChange}
          />

          {result && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <DirectOptionCard direct={result.direct} />
              <OptimizedOptionCard optimized={result.optimized} savings={result.savings} />
            </div>
          )}

          {!result && !isOverLimit && (
            <p className="text-center text-sm text-slate-500">
              Saisissez un montant pour voir la meilleure stratégie de retrait.
            </p>
          )}
        </main>

        <footer className="mt-auto flex flex-col items-center gap-1 pt-16 text-center text-xs text-slate-600">
          <span>Grille tarifaire MVola Cash Point · Madagascar</span>
          <span>
            Développé par{' '}
            <a
              href="https://stephanot.karoza.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-400 hover:underline"
            >
              Stephanot Zafindratafa
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
