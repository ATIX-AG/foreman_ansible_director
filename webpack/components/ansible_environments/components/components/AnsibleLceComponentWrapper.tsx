import React, { Dispatch, SetStateAction } from 'react';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';

import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { AnsibleLceComponent } from './AnsibleLceComponent';
import {
  AnsibleLce,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';

interface AnsibleLceComponentWrapperProps {
  lce: SparseAnsibleLce;
  pathEditMode: boolean;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

interface GetAnsibleLceResponse extends AnsibleLce {}

export const AnsibleLceComponentWrapper: React.FC<AnsibleLceComponentWrapperProps> = ({
  lce,
  pathEditMode,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
}) => {
  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleLceResponse> = useAPI<
    GetAnsibleLceResponse
  >(
    'get',
    foremanUrl(
      `/api/v2/pulsible/lifecycle_environments/${lce.id}/${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (contentRequest.status === 'RESOLVED') {
    return (
      <AnsibleLceComponent
        lce={contentRequest.response}
        pathEditMode={pathEditMode}
        setIsContentUnitModalOpen={setIsContentUnitModalOpen}
        setLifecycleEnv={setLifecycleEnv}
      />
    );
  } else if (contentRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={`Loading LCE "${lce.name}"...`}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
