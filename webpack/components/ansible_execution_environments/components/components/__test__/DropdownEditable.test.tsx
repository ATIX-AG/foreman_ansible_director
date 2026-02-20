import React from 'react';
import { FormSelectOptionProps } from '@patternfly/react-core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropdownEditable } from '../DropdownEditable';

describe('DropdownEditable', () => {
  const dropdownOptions: FormSelectOptionProps[] = [
    { value: 'Item 1', label: 'Item 1' },
    { value: 'Item 2', label: 'Item 2' },
    { value: 'Item 3', label: 'Item 3' },
  ];

  const mockedSetValue: jest.Mock = jest.fn();

  it('renders a disabled dropdown when isEditable is false', () => {
    render(
      <DropdownEditable
        isEditable={false}
        options={dropdownOptions}
        value="Item 1"
        setValue={mockedSetValue}
      />
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders an enabled dropdown when isEditable is true', () => {
    render(
      <DropdownEditable
        isEditable
        options={dropdownOptions}
        value="Item 1"
        setValue={mockedSetValue}
      />
    );

    expect(screen.getByRole('combobox')).toBeEnabled();
  });

  it('renders options as dropdown items', async () => {
    render(
      <DropdownEditable
        isEditable
        options={dropdownOptions}
        value="Item 1"
        setValue={mockedSetValue}
      />
    );

    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Item 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Item 2' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Item 3' })
      ).toBeInTheDocument();
    });
  });
});
