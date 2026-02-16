import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardSelector } from '../CardSelector';

describe('CardSelector', () => {
  const defaultProps = {
    selectedValue: null,
    onSelect: vi.fn(),
    disabled: false,
  };

  it('renders all voting cards', () => {
    render(<CardSelector {...defaultProps} />);

    // Check for specific card values (10 cards: 0,1,2,3,5,8,13,21,?,coffee)
    // Names include keyboard hints (e.g., "1 0" for card 0 with hint 1)
    expect(screen.getByRole('button', { name: /^1\s*0$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^5\s*5$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^7\s*13$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^9\s*\?$/i })).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<CardSelector {...defaultProps} onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: /^5\s*5$/i }));
    expect(handleSelect).toHaveBeenCalledWith('5');
  });

  it('highlights selected card', () => {
    render(<CardSelector {...defaultProps} selectedValue="8" />);

    const selectedCard = screen.getByRole('button', { name: /^6\s*8$/i });
    expect(selectedCard).toHaveClass('bg-[var(--primary)]');
    expect(selectedCard).toHaveClass('-translate-y-2');
  });

  it('disables all cards when disabled', () => {
    render(<CardSelector {...defaultProps} disabled />);

    const cards = screen.getAllByRole('button');
    cards.forEach((card) => {
      expect(card).toBeDisabled();
    });
  });

  it('disables cards when isSubmitting', () => {
    render(<CardSelector {...defaultProps} isSubmitting />);

    const cards = screen.getAllByRole('button');
    cards.forEach((card) => {
      expect(card).toBeDisabled();
    });
  });

  it('shows spinner on selected card when submitting', () => {
    render(<CardSelector {...defaultProps} selectedValue="5" isSubmitting />);

    // Find the selected card by checking for spinner
    const cards = screen.getAllByRole('button');
    const cardWithSpinner = cards.find((card) => card.querySelector('svg.animate-spin'));
    expect(cardWithSpinner).toBeTruthy();
    expect(cardWithSpinner?.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('renders all 10 voting cards', () => {
    render(<CardSelector {...defaultProps} />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(10);
  });

  it('non-selected cards have white background', () => {
    render(<CardSelector {...defaultProps} selectedValue="5" />);

    const nonSelectedCard = screen.getByRole('button', { name: /^4\s*3$/i });
    expect(nonSelectedCard).toHaveClass('bg-white');
    expect(nonSelectedCard).not.toHaveClass('-translate-y-2');
  });

  it('renders coffee card with emoji', () => {
    render(<CardSelector {...defaultProps} />);
    // The coffee card has label from VOTING_CARDS
    const buttons = screen.getAllByRole('button');
    const coffeeButton = buttons.find((btn) => btn.textContent?.includes('\u2615'));
    expect(coffeeButton).toBeTruthy();
  });
});
