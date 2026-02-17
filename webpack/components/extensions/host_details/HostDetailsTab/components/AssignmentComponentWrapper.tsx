import React, { ReactElement } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import {
  IndexResponse,
  useAPI,
  UseAPIReturn,
} from 'foremanReact/common/hooks/API/APIHooks';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _ } from 'foremanReact/common/I18n';
import { AssignmentComponent } from './AssignmentComponent';
import { DenseAnsibleLce } from '../../../../../types/AnsibleEnvironmentsTypes';
import { AnsibleContentUnitWithCounts } from '../../../../ansible_content/components/AnsibleContentTableWrapper';

interface AssignmentComponentWrapperProps {
  ansibleLifecycleEnvironmentId: number;
  hostId: number;
}

export type unnamedAssignmentType = {
  id: number;
  // eslint-disable-next-line camelcase
  consumable_id: number;
  // eslint-disable-next-line camelcase
  consumable_name: string;
  // eslint-disable-next-line camelcase
  source_type: 'collection' | 'role';
  // eslint-disable-next-line camelcase
  source_id: number;
  // eslint-disable-next-line camelcase
  source_identifier: string;
  // eslint-disable-next-line camelcase
  source_version: string;
}[];

interface GetAnsibleContentResponse extends IndexResponse {
  results: AnsibleContentUnitWithCounts[];
}

export type AvailableContentResponse =
  | GetAnsibleContentResponse
  | DenseAnsibleLce;
export const isAnsibleLce = (
  response: AvailableContentResponse
): response is DenseAnsibleLce => 'content_hash' in response;

export const AssignmentComponentWrapper = ({
  ansibleLifecycleEnvironmentId,
  hostId,
}: AssignmentComponentWrapperProps): ReactElement | null => {
  const organization = useForemanOrganization();

  let requestUrl;

  if (ansibleLifecycleEnvironmentId !== null) {
    requestUrl = foremanUrl(
      // eslint-disable-next-line camelcase
      `/api/v2/ansible_director/lifecycle_environments/${ansibleLifecycleEnvironmentId}/`
    );
  } else {
    requestUrl = foremanUrl(
      `/api/v2/ansible_director/ansible_content${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    );
  }

  const availableContent: UseAPIReturn<AvailableContentResponse> = useAPI<
    AvailableContentResponse
  >('get', requestUrl);
  const assignedContent: UseAPIReturn<unnamedAssignmentType> = useAPI<
    unnamedAssignmentType
  >('get', foremanUrl(`/api/v2/ansible_director/assignments/HOST/${hostId}`));

  // TODO: Even though the API correctly returns an empty array when no content is assigned, the hook returns an empty object
  if (
    availableContent.status === 'RESOLVED' &&
    assignedContent.status === 'RESOLVED'
  ) {
    return (
      <Bullseye>
        <AssignmentComponent
          contentResponse={availableContent.response}
          assignedContent={
            Object.keys(assignedContent.response).length === 0
              ? []
              : assignedContent.response
          }
          hostId={hostId}
        />
      </Bullseye>
    );
  } else if (
    availableContent.status === 'ERROR' ||
    assignedContent.status === 'ERROR'
  ) {
    // TODO: Handle request error
    return null;
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading lifecycle environment content...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
