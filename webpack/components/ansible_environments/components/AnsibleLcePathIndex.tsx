import React from 'react';
import { Stack, StackItem, Divider } from '@patternfly/react-core';

import { AnsibleLcePath } from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponent } from './components/AnsibleLcePathComponent';

import { AnsibleLibraryOverview } from './components/AnsibleLibraryOverview';

interface AnsibleLcePathIndexProps {
  lcePaths: AnsibleLcePath[];
  refreshRequest: () => void;
}

export const AnsibleLcePathIndex: React.FC<AnsibleLcePathIndexProps> = ({
  lcePaths,
  refreshRequest,
}) => (
  <>
    <Stack>
      <StackItem
        style={{
          padding: '10px 20px 10px 20px',
        }}
      >
        <AnsibleLibraryOverview />
      </StackItem>
      <Divider component="div" style={{ padding: '10px 20px 10px 20px' }} />
      {lcePaths.map(lcePath => (
        <StackItem
          style={{
            padding: '10px 20px 10px 20px',
          }}
        >
          <AnsibleLcePathComponent
            lcePath={lcePath}
            refreshRequest={refreshRequest}
          />
        </StackItem>
      ))}
    </Stack>
  </>
);
