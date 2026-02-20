import React, { ReactElement } from 'react';
import {
  FormSelect,
  FormSelectOption,
  FormSelectOptionProps,
} from '@patternfly/react-core';

interface DropdownEditableProps {
  isEditable: boolean;
  options: FormSelectOptionProps[];
  value: string;
  setValue: (event: React.FormEvent<HTMLSelectElement>, value: string) => void;
}
export const DropdownEditable = ({
  isEditable,
  options,
  value,
  setValue,
}: DropdownEditableProps): ReactElement => {
  const optionItems = (): ReactElement[] =>
    options.map((option, index) => (
      <FormSelectOption key={index} value={option.value} label={option.label} />
    ));
  return (
    <FormSelect
      isDisabled={!isEditable}
      value={value}
      onChange={setValue}
      aria-label="FormSelect Input"
      ouiaId="BasicFormSelect"
      data-testid="dropdown-editable-select"
    >
      {optionItems()}
    </FormSelect>
  );
};
