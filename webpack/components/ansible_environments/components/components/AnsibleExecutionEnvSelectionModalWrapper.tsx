import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';

import { useTableIndexAPIResponse } from 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { AnsibleExecutionEnvSelectionModal } from './AnsibleExecutionEnvSelectionModal';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';
import { GetAnsibleExecutionEnvResponse } from '../../../ansible_execution_environments/components/ExecutionEnvGridWrapper';

interface AnsibleExecutionEnvSelectionModalWrapperProps {
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
  lifecycleEnv: AnsibleLce;
  refreshRequest: () => void;
}

export const AnsibleExecutionEnvSelectionModalWrapper = ({
  setIsExecutionEnvModalOpen,
  lifecycleEnv,
  refreshRequest,
}: AnsibleExecutionEnvSelectionModalWrapperProps): ReactElement => {
  const a = 2;

  const organization = useForemanOrganization();

  const executionEnvResponse = useTableIndexAPIResponse<
    GetAnsibleExecutionEnvResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible/execution_environments${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    ),
  });

  if (executionEnvResponse.status === 'RESOLVED') {
    return (
      <AnsibleExecutionEnvSelectionModal
        executionEnvironments={executionEnvResponse.response.results}
        setIsExecutionEnvModalOpen={setIsExecutionEnvModalOpen}
        lifecycleEnv={lifecycleEnv}
        refreshRequest={refreshRequest}
      />
    );
  } else if (executionEnvResponse.status === 'ERROR') {
    // TODO: Handle request error
  }

  return (
    <Modal isOpen variant={ModalVariant.large}>
      <EmptyPage
        message={{ type: 'loading', text: 'Loading Execution Environments...' }}
      />
    </Modal>
  );
};
