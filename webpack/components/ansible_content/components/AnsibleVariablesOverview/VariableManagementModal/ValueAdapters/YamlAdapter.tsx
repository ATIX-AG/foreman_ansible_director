import React, { ReactElement } from 'react';
import { YamlEditor } from '../../../../../common/YamlEditor';

interface YamlAdapterProps {
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const YamlAdapter = ({
  isEditMode,
  value,
  onChange,
}: YamlAdapterProps): ReactElement => (
  <YamlEditor
    yamlFile={value}
    setYamlFile={onChange}
    isReadOnly={!isEditMode}
  />
);
