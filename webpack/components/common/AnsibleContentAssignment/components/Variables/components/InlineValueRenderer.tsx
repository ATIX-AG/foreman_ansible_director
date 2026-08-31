import React, { ReactElement } from 'react';
import { Button, CodeBlock, CodeBlockCode, Popover, TextInput, Truncate } from '@patternfly/react-core';
import { load } from 'js-yaml';
import { AnsibleVariable, AnsibleVariableBinding } from '../../../../../../types/AnsibleVariableTypes';

interface InlineValueRendererProps {
  item: AnsibleVariable | AnsibleVariableBinding;
}

export const InlineValueRenderer = ({
  item,
}: InlineValueRendererProps): ReactElement => {

  const valuePreview = (item: AnsibleVariable | AnsibleVariableBinding): ReactElement => {
    let loadedValue;
    switch (item.data_type) {
      case 'boolean':
      case 'integer':
      case 'float':
        loadedValue = load(item.raw_value) as string;
        return (
          <TextInput value={loadedValue} type="text" aria-label="disabled text input example" isDisabled />
        );
      case 'string':
        loadedValue = load(item.raw_value) as string;
        return (
          <Truncate
            content={loadedValue}
            trailingNumChars={10}
            position={'middle'}
          />
        );
      default:
        return (
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
    }
  };

  return valuePreview(item);
};
