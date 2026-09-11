import React, { ReactElement } from 'react';
import { Button, CodeBlock, CodeBlockCode, Popover, TextInput, Truncate } from '@patternfly/react-core';
import {
  AnsibleVariable,
  AnsibleVariableBinding,
} from '../../../../../../types/AnsibleVariableTypes';
import { getYamlValidity, YamlValidity } from '../utils';

interface InlineValueRendererProps {
  item: AnsibleVariable | AnsibleVariableBinding;
}

export const InlineValueRenderer = ({
  item,
}: InlineValueRendererProps): ReactElement => {

  const defaultRenderer = (
    <Popover
      hasAutoWidth
      triggerAction="hover"
      aria-label="Hoverable popover"
      headerContent={<div>Effective value</div>}
      bodyContent={
        <div style={{ width: '20vw' }}>
          <CodeBlock>
            <CodeBlockCode id="code-content">
              {item.raw_value}
            </CodeBlockCode>
          </CodeBlock>
        </div>
      }
    >
      <Button variant={'secondary'}>Hover to preview value</Button>
    </Popover>
  );

  const valuePreview = (item: AnsibleVariable | AnsibleVariableBinding): ReactElement => {
    let loaded: YamlValidity = getYamlValidity(item.raw_value, item.data_type);

    // catches bad YAML should it somehow get into the system and type mismatches
    if (loaded.state !== 'valid') {
      return defaultRenderer;
    }

    switch (item.data_type) {
      case 'boolean':
      case 'integer':
      case 'float':
        return (
          <TextInput value={loaded.parsed as string} type="text" aria-label="disabled text input example" isDisabled />
        );
      case 'string':
        return (
          <Truncate
            content={loaded.parsed as string}
            trailingNumChars={10}
            position={'middle'}
          />
        );
      default:
        return defaultRenderer;
    }
  };

  return valuePreview(item);
};
