import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GitRefInput } from '../GitRefInput';

describe('GitRefInput', () => {
  let mockSetGitRefs: jest.Mock;
  let initialGitRefs: string[];

  beforeEach(() => {
    mockSetGitRefs = jest.fn();
    initialGitRefs = ['main'];
  });

  it('renders git refs as chips', () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );
    expect(screen.getByText('Only import:')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('displays validation error for invalid input format', () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );

    const input = screen.getByTestId('git-ref-input');
    fireEvent.change(input, { target: { value: 'main develop' } });

    expect(
      screen.getByText(
        'Ref list does not conform to the pattern: "<Ref>, <Ref>"'
      )
    ).toBeInTheDocument();
  });

  it('does not display validation error for valid input format', () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );

    const input = screen.getByTestId('git-ref-input');
    fireEvent.change(input, {
      target: { value: 'main, develop' },
    });

    expect(
      screen.queryByText(
        'Ref list does not conform to the pattern: "<Ref>, <Ref>"'
      )
    ).not.toBeInTheDocument();
  });

  it('adds git reference when button is clicked', () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );

    const input = screen.getByTestId('git-ref-input');
    fireEvent.change(input, { target: { value: 'develop' } });

    const addButton = screen.getByTestId('add-git-ref-btn');
    fireEvent.click(addButton);

    expect(mockSetGitRefs).toHaveBeenCalledTimes(1);
    const updatedArray = mockSetGitRefs.mock.calls[0][0](initialGitRefs);

    expect(updatedArray).toContain('main');
    expect(updatedArray).toContain('develop');
  });

  it('adds git reference when Enter key is pressed', async () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );

    const input = screen.getByTestId('git-ref-input');
    fireEvent.change(input, { target: { value: 'develop' } });

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockSetGitRefs).toHaveBeenCalledTimes(1);
    const updatedArray = mockSetGitRefs.mock.calls[0][0](initialGitRefs);

    expect(updatedArray).toContain('main');
    expect(updatedArray).toContain('develop');
  });

  it('removes git reference when chip is clicked', () => {
    render(
      <GitRefInput gitRefs={initialGitRefs} setGitRefs={mockSetGitRefs} />
    );

    const chip = screen.getByRole('button', { name: /close/i });

    fireEvent.click(chip);

    expect(mockSetGitRefs).toHaveBeenCalledTimes(1);
    const updatedArray = mockSetGitRefs.mock.calls[0][0](initialGitRefs);

    expect(updatedArray).not.toContain('main');
  });
});
