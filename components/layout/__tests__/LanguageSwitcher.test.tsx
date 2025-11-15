import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock dependencies
const mockPush = vi.fn();
const mockPathname = '/uk/events';

vi.mock('next-intl', () => ({
  useLocale: () => 'uk',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock('@/i18n', () => ({
  locales: ['uk', 'en'],
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render language switcher with both locale buttons', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: /switch to ukrainian/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument();
  });

  it('should highlight the current locale', () => {
    render(<LanguageSwitcher />);

    const ukButton = screen.getByRole('button', { name: /switch to ukrainian/i });
    const enButton = screen.getByRole('button', { name: /switch to english/i });

    expect(ukButton).toHaveClass('bg-primary');
    expect(enButton).toHaveClass('bg-secondary');
  });

  it('should call router.push with correct path when switching locale', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const enButton = screen.getByRole('button', { name: /switch to english/i });
    await user.click(enButton);

    expect(mockPush).toHaveBeenCalledWith('/en/events');
  });

  it('should display locale codes in uppercase', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText('UK')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should have proper accessibility labels', () => {
    render(<LanguageSwitcher />);

    const ukButton = screen.getByRole('button', { name: /switch to ukrainian/i });
    const enButton = screen.getByRole('button', { name: /switch to english/i });

    expect(ukButton).toHaveAttribute('aria-label', 'Switch to Ukrainian');
    expect(enButton).toHaveAttribute('aria-label', 'Switch to English');
  });
});
