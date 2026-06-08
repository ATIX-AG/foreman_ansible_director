import React, { ReactElement } from 'react';

import { StringAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/StringAdapter';
import { BooleanAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/IntegerAdapter';
import { RealAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/RealAdapter';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';

export const MergedOverrideValueAdapter = ({
  override,
  isEditMode,
  overrideValue,
  setOverrideValue,
}: {
  override: MergedVariableOverride;
  isEditMode: boolean;
  overrideValue: string | number | boolean | undefined;
  setOverrideValue: (value: string | number | boolean) => void;
}): ReactElement | null => {
  switch (override.type) {
    case 'string':
      return (
        <StringAdapter
          isEditMode={isEditMode}
          value={overrideValue as string}
          onChange={value => setOverrideValue(value)}
        />
      );
    case 'boolean':
      return (
        <BooleanAdapter
          isEditMode={isEditMode}
          value={overrideValue as boolean}
          onChange={value => setOverrideValue(value)}
        />
      );
    case 'integer':
      return (
        <IntegerAdapter
          isEditMode={isEditMode}
          value={overrideValue as number}
          onChange={value => setOverrideValue(value)}
        />
      );
    case 'real':
      return (
        <RealAdapter
          isEditMode={isEditMode}
          value={overrideValue as number}
          onChange={value => setOverrideValue(value)}
        />
      );
    default:
      return null;
  }
};
