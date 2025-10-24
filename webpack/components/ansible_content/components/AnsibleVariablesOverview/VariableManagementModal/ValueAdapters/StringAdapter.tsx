import React, { ReactElement } from 'react';
import { TextInputEditable } from '../../../../../ansible_execution_environments/components/components/TextInputEditable';

interface StringAdapterProps {
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const StringAdapter = ({
  isEditMode,
  value,
  onChange,
}: StringAdapterProps): ReactElement => (
  <>
    <TextInputEditable
      isEditable={isEditMode}
      value={value}
      setValue={(_event, newValue: string) => onChange(newValue)}
    />
  </>
);
