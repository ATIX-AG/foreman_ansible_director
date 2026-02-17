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
import Permitted from 'foremanReact/components/Permitted';
import { translate as _ } from 'foremanReact/common/I18n';

import { AssignmentComponentWrapper } from './components/AssignmentComponentWrapper';
import { OverrideGridWrapper } from './components/OverrideGridWrapper';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';

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
              <TabTitleText>{_('Content')}</TabTitleText>{' '}
            </>
          }
        >
          <Permitted requiredPermissions={[AdPermissions.assignments.view]}>
            <AssignmentComponentWrapper
              ansibleLifecycleEnvironmentId={
                response.ansible_lifecycle_environment_id
              }
              hostId={response.id}
            />
          </Permitted>
        </Tab>
        <Tab
          eventKey={1}
          title={
            <>
              <TabTitleIcon>
                <DatabaseIcon />
              </TabTitleIcon>{' '}
              <TabTitleText>{_('Variables')}</TabTitleText>{' '}
            </>
          }
        >
          <Permitted
            requiredPermissions={[AdPermissions.ansibleVariableOverrides.view]}
          >
            <OverrideGridWrapper hostId={response.id} fqdn={response.name} />
          </Permitted>
        </Tab>
      </Tabs>
    );
  }
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading host details...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
