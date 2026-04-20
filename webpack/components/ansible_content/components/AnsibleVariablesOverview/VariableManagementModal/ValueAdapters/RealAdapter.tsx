import React, { ReactElement } from 'react';
import { Bullseye, NumberInput } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

interface RealAdapterProps {
  isEditMode: boolean;
  value: number;
  onChange: (value: number) => void;
}

export const RealAdapter = ({
  isEditMode,
  value,
  onChange,
}: RealAdapterProps): ReactElement => (
  <Bullseye>
    <NumberInput
      isDisabled={!isEditMode}
      value={Number(value)}
      onMinus={() => onChange(value - 0.1)}
      onChange={event => {
        const inputValue = event.target as HTMLInputElement;
        const numberValue = Number(inputValue.value);

        if (!Number.isNaN(numberValue)) {
          onChange(numberValue);
        } else {
          onChange(0);
        }
      }}
      onPlus={() => onChange(value + 0.1)}
      inputName="input1"
      inputAriaLabel={_('number input 1')}
      minusBtnAriaLabel={_('input 2 minus')}
      plusBtnAriaLabel={_('input 2 plus')}
      widthChars={10}
    />
  </Bullseye>
);
