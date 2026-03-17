import React, { FormEvent } from 'react';
import { TextInput } from '@patternfly/react-core';

interface TextInputEditableProps {
  validated?: 'success' | 'warning' | 'error' | 'default';
  isEditable: boolean;
  value: string | number;
  setValue: (event: FormEvent<HTMLInputElement>, value: string) => void;
}

export const TextInputEditable: React.FC<TextInputEditableProps> = ({
  validated = 'default',
  isEditable,
  value,
  setValue,
}) => (
  <TextInput
    validated={validated}
    isDisabled={!isEditable}
    value={value}
    type="text"
    onChange={setValue}
    aria-label="text input example"
  />
);
