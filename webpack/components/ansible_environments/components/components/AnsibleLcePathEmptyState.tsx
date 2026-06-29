import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

interface AnsibleLcePathEmptyStateProps {
  insertFirstEnv: (name: string) => Promise<void>;
}
export const AnsibleLcePathEmptyState = ({
  insertFirstEnv,
}: AnsibleLcePathEmptyStateProps): ReactElement => (
  <EmptyState style={{ padding: '0px' }}>
    <EmptyStateBody>
      {_('This lifecycle environment path contains no lifecycle environments.')}
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="primary" onClick={() => insertFirstEnv('DEV')}>
          {_('Create lifecycle environment')}
        </Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);
