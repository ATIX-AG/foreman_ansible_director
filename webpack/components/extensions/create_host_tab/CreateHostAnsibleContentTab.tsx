import React, { useState } from 'react';
import {
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { InheritComponent } from '../components/InheritComponent';
import { LifecycleEnvComponentWrapper } from '../components/LifecycleEnvComponentWrapper';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const CreateHostAnsibleContentTab = () => {
  const [contentSource, setContentSource] = useState<
    'direct' | 'inherit' | 'lce'
  >('lce');

  const contentComponent = (): React.ReactNode => {
    switch (contentSource) {
      case 'direct':
        return <div>TODO</div>;
      case 'inherit':
        return <InheritComponent />;
      case 'lce':
        return <LifecycleEnvComponentWrapper>bla</LifecycleEnvComponentWrapper>;
      default:
        return null;
    }
  };

  return (
    <Stack>
      <StackItem>
        <ToggleGroup aria-label={_('Content source selector')}>
          <ToggleGroupItem
            text={_('Direct assignment')}
            buttonId="toggle-group-single-1"
            isSelected={contentSource === 'direct'}
            onChange={() => setContentSource('direct')}
          />
          <ToggleGroupItem
            text={_('Inherit from Hostgroup')}
            buttonId="toggle-group-single-2"
            isSelected={contentSource === 'inherit'}
            onChange={() => setContentSource('inherit')}
          />
          <ToggleGroupItem
            text={_('Lifecycle environment')}
            buttonId="toggle-group-single-3"
            isSelected={contentSource === 'lce'}
            onChange={() => setContentSource('lce')}
          />
        </ToggleGroup>
      </StackItem>
      {contentComponent()}
      <StackItem />
    </Stack>
  );
};
