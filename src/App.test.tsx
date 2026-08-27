import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('<App />', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it("affiche une invite tant qu'aucun montant n'est saisi", () => {
    render(<App />);
    expect(
      screen.getByText(/Saisissez un montant pour voir la meilleure stratégie/i),
    ).toBeInTheDocument();
  });

  it('affiche les deux options et une économie après saisie (retrait)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Montant total à retirer/i), '265000');

    expect(screen.getByText('Retrait direct')).toBeInTheDocument();
    expect(screen.getByText('Retrait fractionné')).toBeInTheDocument();
    expect(screen.getByText(/économisés vs\. retrait direct/i)).toBeInTheDocument();
  });

  it('bascule en mode transfert et adapte les libellés', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Transfert' }));
    await user.type(screen.getByLabelText(/Montant total à transférer/i), '300000');

    // destination par défaut : vers un abonné MVola
    await user.click(screen.getByRole('button', { name: /non-abonné/i }));

    expect(screen.getByText('Transfert direct')).toBeInTheDocument();
    expect(screen.getByText('Transfert fractionné')).toBeInTheDocument();
    expect(screen.getByText(/économisés vs\. transfert direct/i)).toBeInTheDocument();
  });

  it('avertit quand le montant dépasse le plafond de la grille', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Montant total à retirer/i), '25000000');

    expect(screen.getByText(/Montant maximum géré par cette grille tarifaire/i)).toBeInTheDocument();
    expect(screen.queryByText('Retrait fractionné')).not.toBeInTheDocument();
  });

  it('mentionne le tarif officiel mvola.mg/tarifs', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /mvola\.mg\/tarifs/i });
    expect(link).toHaveAttribute('href', 'https://www.mvola.mg/tarifs/');
  });
});
