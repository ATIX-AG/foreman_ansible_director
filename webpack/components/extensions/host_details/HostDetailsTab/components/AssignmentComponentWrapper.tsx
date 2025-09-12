import React, { ReactElement } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { AssignmentComponent } from './AssignmentComponent';
import {
  AnsibleContentUnit,
  AnsibleContentUnitFull,
} from '../../../../../types/AnsibleContentTypes';

interface AssignmentComponentWrapperProps {
  ansibleLifecycleEnvironmentId: number;
}

interface ShowLceResponse {
  content: {
    collections: AnsibleContentUnitFull[];
    roles: AnsibleContentUnit[];
  };
}

export const AssignmentComponentWrapper = ({
  ansibleLifecycleEnvironmentId,
}: AssignmentComponentWrapperProps): ReactElement | null => {
  const [chosenUnits, setChosenUnits] = React.useState<{
    [unit: string]: string[];
  }>({});

  const showLceRequest: UseAPIReturn<ShowLceResponse> = useAPI<ShowLceResponse>(
    'get',
    foremanUrl(
      // eslint-disable-next-line camelcase
      `/api/v2/pulsible/lifecycle_environments/${ansibleLifecycleEnvironmentId}/content?full=true`
    )
  );

  if (showLceRequest.status === 'RESOLVED') {
    return (
      <Bullseye>
        <AssignmentComponent
          lceUnits={showLceRequest.response.content}
          chosenUnits={chosenUnits}
          setChosenUnits={setChosenUnits}
        />
      </Bullseye>
    );
  } else if (showLceRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="Loading Lifecycle Environment content..."
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
