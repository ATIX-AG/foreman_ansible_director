import React, { ReactElement } from 'react';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
} from '@patternfly/react-core';

import IntegrationIcon from '@patternfly/react-icons/dist/esm/icons/integration-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';

import { UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';

import { AssignmentComponentWrapper } from './components/AssignmentComponentWrapper';
import { OverrideGridWrapper } from './components/OverrideGridWrapper';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

interface HostDetailsTabProps
  extends UseAPIReturn<{
    // eslint-disable-next-line camelcase
    ansible_lifecycle_environment_id: number;
    id: number;
    name: string;
  }> {}

export const HostDetailsTab = ({
  status,
  response,
}: HostDetailsTabProps): ReactElement => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  if (status === 'RESOLVED') {
    return (
      <Tabs
        isFilled
        activeKey={activeTabKey}
        onSelect={(event, tabIndex) => setActiveTabKey(tabIndex)}
        isBox
        aria-label="Tabs in the filled with icons example"
        role="region"
      >
        <Tab
          eventKey={0}
          title={
            <>
              <TabTitleIcon>
                <IntegrationIcon />
              </TabTitleIcon>{' '}
              <TabTitleText>Content</TabTitleText>{' '}
            </>
          }
        >
          <AssignmentComponentWrapper
            ansibleLifecycleEnvironmentId={
              response.ansible_lifecycle_environment_id
            }
            hostId={response.id}
          />
        </Tab>
        <Tab
          eventKey={1}
          title={
            <>
              <TabTitleIcon>
                <DatabaseIcon />
              </TabTitleIcon>{' '}
              <TabTitleText>Variables</TabTitleText>{' '}
            </>
          }
        >
          <OverrideGridWrapper hostId={response.id} fqdn={response.name} />
        </Tab>
      </Tabs>
    );
  }
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="Waiting for host to load..."
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
