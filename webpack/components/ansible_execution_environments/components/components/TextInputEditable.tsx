import React, { FormEvent } from 'react';
import { TextInput } from '@patternfly/react-core';

interface TextInputEditableProps {
  isEditable: boolean;
  value: string | number;
  setValue: (event: FormEvent<HTMLInputElement>, value: string) => void;
}

export const TextInputEditable: React.FC<TextInputEditableProps> = ({
  isEditable,
  value,
  setValue,
}) => (
  <TextInput
    isDisabled={!isEditable}
    value={value}
    type="text"
    onChange={setValue}
    aria-label="text input example"
  />
);
