import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';

export const AnsibleLcePathEmptyState: React.FunctionComponent = () => (
  <EmptyState style={{ padding: '0px' }}>
    <EmptyStateBody>
      This Lifecycle Environment Path contains no Lifecycle Environments.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="primary">Create Lifecycle Environment</Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);
