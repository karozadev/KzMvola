import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('<App />', () => {
  it('affiche une invite tant qu\'aucun montant n\'est saisi', () => {
    render(<App />);
    expect(
      screen.getByText(/Saisissez un montant pour voir la meilleure stratégie/i),
    ).toBeInTheDocument();
  });

  it('affiche les deux options et une économie après saisie', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Montant total à retirer/i), '265000');

    expect(screen.getByText('Retrait direct')).toBeInTheDocument();
    expect(screen.getByText('Retrait fractionné')).toBeInTheDocument();
    expect(screen.getByText(/économisés vs\. retrait direct/i)).toBeInTheDocument();
  });

  it('avertit quand le montant dépasse le plafond de la grille', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Montant total à retirer/i), '25000000');

    expect(screen.getByText(/Montant maximum géré par la grille tarifaire/i)).toBeInTheDocument();
    expect(screen.queryByText('Retrait fractionné')).not.toBeInTheDocument();
  });
});
