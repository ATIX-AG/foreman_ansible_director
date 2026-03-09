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
      This lifecycle environment path contains no lifecycle environments.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="primary" onClick={() => insertFirstEnv('DEV')}>
          Create lifecycle environment
        </Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);
