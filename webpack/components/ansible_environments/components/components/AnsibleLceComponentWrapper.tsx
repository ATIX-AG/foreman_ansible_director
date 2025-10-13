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
  refreshRequest: () => void;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
}

interface GetAnsibleLceResponse extends AnsibleLce {}

export const AnsibleLceComponentWrapper: React.FC<AnsibleLceComponentWrapperProps> = ({
  lce,
  pathEditMode,
  refreshRequest,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
  setIsExecutionEnvModalOpen,
}) => {
  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleLceResponse> = useAPI<
    GetAnsibleLceResponse
  >(
    'get',
    foremanUrl(
      `/api/v2/ansible/lifecycle_environments/${lce.id}/${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (contentRequest.status === 'RESOLVED') {
    return (
      <AnsibleLceComponent
        lce={contentRequest.response}
        pathEditMode={pathEditMode}
        refreshRequest={refreshRequest}
        setIsContentUnitModalOpen={setIsContentUnitModalOpen}
        setLifecycleEnv={setLifecycleEnv}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        setConfirmationModalTitle={setConfirmationModalTitle}
        setConfirmationModalBody={setConfirmationModalBody}
        setConfirmationModalOnConfirm={setConfirmationModalOnConfirm}
        setIsExecutionEnvModalOpen={setIsExecutionEnvModalOpen}
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
