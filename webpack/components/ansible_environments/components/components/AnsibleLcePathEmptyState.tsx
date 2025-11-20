import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';

interface AnsibleLcePathEmptyStateProps {
  insertFirstEnv: (name: string) => Promise<void>;
}
export const AnsibleLcePathEmptyState = ({
  insertFirstEnv,
}: AnsibleLcePathEmptyStateProps): ReactElement => (
  <EmptyState style={{ padding: '0px' }}>
    <EmptyStateBody>
      This Lifecycle Environment Path contains no Lifecycle Environments.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="primary" onClick={() => insertFirstEnv('DEV')}>
          Create Lifecycle Environment
        </Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);
