import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveOperation } from '../utils/feeGrids';
import { DirectOptionCard } from './DirectOptionCard';
import { OptimizedOptionCard } from './OptimizedOptionCard';

const retrait = resolveOperation('retrait', 'mvola').wording;
const transfert = resolveOperation('transfert', 'mvola').wording;

describe('<DirectOptionCard />', () => {
  it('affiche le montant et les frais quand l’opération est possible', () => {
    render(
      <DirectOptionCard direct={{ possible: true, amount: 265_000, fee: 4_700 }} wording={retrait} />,
    );
    expect(screen.getByText('Retrait direct')).toBeInTheDocument();
    expect(screen.getByText('Retirer en une fois')).toBeInTheDocument();
    expect(screen.getByText('4 700 Ar')).toBeInTheDocument();
  });

  it('affiche le message d’indisponibilité au-delà du plafond', () => {
    render(
      <DirectOptionCard
        direct={{ possible: false, amount: 9_000_000, fee: null }}
        wording={transfert}
      />,
    );
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
    expect(screen.getByText(/Transfert impossible en une seule transaction/i)).toBeInTheDocument();
  });
});

describe('<OptimizedOptionCard />', () => {
  it('liste les envois et la bannière d’économie avec le vocabulaire transfert', () => {
    render(
      <OptimizedOptionCard
        direct={{ possible: true, amount: 300_000, fee: 15_000 }}
        optimized={{
          operations: [
            { amount: 250_000, fee: 10_000 },
            { amount: 50_000, fee: 3_800 },
          ],
          totalFee: 13_800,
          totalAmount: 300_000,
        }}
        savings={1_200}
        wording={transfert}
      />,
    );
    expect(screen.getByText(/Transfert fractionné en 2 envois/i)).toBeInTheDocument();
    expect(screen.getByText(/Envoi 1 ·/)).toBeInTheDocument();
    expect(screen.getByText(/économisés vs\. transfert direct/i)).toBeInTheDocument();
  });

  it('indique « Optimal » quand aucun fractionnement n’est utile', () => {
    render(
      <OptimizedOptionCard
        direct={{ possible: true, amount: 3_000, fee: 150 }}
        optimized={{ operations: [{ amount: 3_000, fee: 150 }], totalFee: 150, totalAmount: 3_000 }}
        savings={0}
        wording={retrait}
      />,
    );
    expect(screen.getByText('Optimal')).toBeInTheDocument();
    expect(screen.getByText('Aucun fractionnement nécessaire')).toBeInTheDocument();
  });
});
