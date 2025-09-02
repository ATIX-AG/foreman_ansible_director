import React, { ReactElement, useState } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';

import IntegrationIcon from '@patternfly/react-icons/dist/esm/icons/integration-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import RepositoryIcon from '@patternfly/react-icons/dist/esm/icons/repository-icon';
import InfrastructureIcon from '@patternfly/react-icons/dist/esm/icons/infrastructure-icon';
import DataProcessorIcon from '@patternfly/react-icons/dist/esm/icons/data-processor-icon';

import { UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';

import { InheritComponent } from '../../components/InheritComponent';
import { AssignmentComponentWrapper } from './components/AssignmentComponentWrapper';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

interface HostDetailsTabProps  // eslint-disable-next-line camelcase
  extends UseAPIReturn<{ ansible_lifecycle_environment_id: number }> {}

export const HostDetailsTab = ({
  status,
  response,
}: HostDetailsTabProps): ReactElement => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const [contentSource, setContentSource] = useState<
    'assign' | 'inherit' | 'lce'
  >('assign');

  const contentComponent = (): React.ReactNode => {
    switch (contentSource) {
      case 'assign':
        return (
          <AssignmentComponentWrapper
            ansibleLifecycleEnvironmentId={
              response.ansible_lifecycle_environment_id
            }
          />
        );
      case 'inherit':
        return <InheritComponent />;
      default:
        return null;
    }
  };

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
          {' '}
          <Stack>
            <StackItem style={{ padding: '20px 0px 0px 20px' }}>
              <Bullseye>
                <ToggleGroup aria-label="Default with single selectable">
                  <ToggleGroupItem
                    icon={<RepositoryIcon />}
                    text="Direct assignment"
                    buttonId="toggle-group-single-1"
                    isSelected={contentSource === 'assign'}
                    onChange={() => setContentSource('assign')}
                  />
                  <ToggleGroupItem
                    icon={<InfrastructureIcon />}
                    text="Inherit from Hostgroup"
                    buttonId="toggle-group-single-2"
                    isSelected={contentSource === 'inherit'}
                    onChange={() => setContentSource('inherit')}
                  />
                  <ToggleGroupItem
                    icon={<DataProcessorIcon />}
                    text="Lifecycle Environment"
                    buttonId="toggle-group-single-3"
                    isSelected={contentSource === 'lce'}
                    onChange={() => setContentSource('lce')}
                  />
                </ToggleGroup>
              </Bullseye>
            </StackItem>
            {contentComponent()}
            <StackItem />
          </Stack>
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
          TODO
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
