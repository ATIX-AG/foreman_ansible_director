import React, { ReactElement } from 'react';
import { Bullseye, NumberInput } from '@patternfly/react-core';

interface IntegerAdapterProps {
  isEditMode: boolean;
  value: number;
  onChange: (value: number) => void;
}

export const IntegerAdapter = ({
  isEditMode,
  value,
  onChange,
}: IntegerAdapterProps): ReactElement => (
  <Bullseye>
    <NumberInput
      isDisabled={!isEditMode}
      value={Number(value)}
      onMinus={() => onChange(value - 1)}
      onChange={event => {
        const inputValue = event.target as HTMLInputElement;
        const numberValue = Number(inputValue.value);

        if (!Number.isNaN(numberValue)) {
          onChange(numberValue);
        } else {
          onChange(0);
        }
      }}
      onPlus={() => onChange(value + 1)}
      inputName="input1"
      inputAriaLabel="number input 1"
      minusBtnAriaLabel="input 2 minus"
      plusBtnAriaLabel="input 2 plus"
      widthChars={10}
    />
  </Bullseye>
);
