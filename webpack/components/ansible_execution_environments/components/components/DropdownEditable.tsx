import React from 'react';
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
export const DropdownEditable: React.FC<DropdownEditableProps> = ({
  isEditable,
  options,
  value,
  setValue,
}) => (
  <FormSelect
    isDisabled={!isEditable}
    value={value}
    onChange={setValue}
    aria-label="FormSelect Input"
    ouiaId="BasicFormSelect"
  >
    {options.map((option, index) => (
      <FormSelectOption key={index} value={option.value} label={option.label} />
    ))}
  </FormSelect>
);
