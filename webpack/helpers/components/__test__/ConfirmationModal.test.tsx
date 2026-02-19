import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  RenderResult,
} from '@testing-library/react';
import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnAbort = jest.fn();
  const setIsConfirmationModalOpen = jest.fn();

  const renderModal = (propsOverrides = {}): RenderResult =>
    render(
      <ConfirmationModal
        isConfirmationModalOpen
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        title="Test Title"
        body="Test body content"
        onConfirm={mockOnConfirm}
        onAbort={mockOnAbort}
        {...propsOverrides}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with title and body', () => {
    renderModal();

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test body content')).toBeInTheDocument();
  });

  it('does not render when isConfirmationModalOpen is false', () => {
    render(
      <ConfirmationModal
        isConfirmationModalOpen={false}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        title="Test Title"
        body="Test body content"
        onConfirm={mockOnConfirm}
        onAbort={mockOnAbort}
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders Confirm and Cancel buttons', () => {
    renderModal();

    expect(
      screen.getByRole('button', { name: /confirm/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm button is clicked', async () => {
    renderModal();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('hides modal after confirm', async () => {
    renderModal();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(setIsConfirmationModalOpen).toHaveBeenCalledWith(false);
    });
  });

  it('hides modal after cancel if onAbort is not given', async () => {
    renderModal({ onAbort: null });

    const confirmButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(setIsConfirmationModalOpen).toHaveBeenCalledWith(false);
    });
  });

  it('shows spinning state on Confirm button during onConfirm execution', async () => {
    const asyncOnConfirm = jest.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    renderModal({ onConfirm: asyncOnConfirm });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(confirmButton).toHaveClass('pf-m-progress');

    await waitFor(() => {
      expect(confirmButton).not.toHaveClass(
        'pf-m-progress',
        'pf-m-in-progress'
      );
    });
  });

  it('calls onAbort when Cancel button is clicked', () => {
    renderModal();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnAbort).toHaveBeenCalledTimes(1);
  });
});
