import React, { ReactElement } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';

interface BooleanAdapterProps {
  isEditMode: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BooleanAdapter = ({
  isEditMode,
  value,
  onChange,
}: BooleanAdapterProps): ReactElement => (
  <ToggleGroup areAllGroupsDisabled={!isEditMode}>
    <ToggleGroupItem
      text="True"
      buttonId="toggle-group-single-1"
      isSelected={value}
      onChange={(_event, selected) => selected && onChange(true)}
    />
    <ToggleGroupItem
      text="False"
      buttonId="toggle-group-single-1"
      isSelected={!value}
      onChange={(_event, selected) => selected && onChange(false)}
    />
  </ToggleGroup>
);
