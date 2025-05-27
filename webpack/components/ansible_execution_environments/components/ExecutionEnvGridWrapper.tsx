import React from 'react';
import axios from 'axios';
import {
  IndexResponse,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import {
  useSetParamsAndApiAndSearch,
  useTableIndexAPIResponse,
} from 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { ExecutionEnvGrid } from '../ExecutionEnvGrid';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ContentUnitModal } from './ContentUnitModal';

export interface GetAnsibleExecutionEnvResponse extends IndexResponse {
  results: AnsibleExecutionEnv[];
}

const ExecutionEnvGridWrapper: React.FC = () => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState<
    boolean
  >(false);

  const [confirmationModalMode, setConfirmationModalMode] = React.useState<
    'update' | 'destroy'
  >('destroy');

  const [confirmationModalTitle, setConfirmationModalTitle] = React.useState<
    string
  >('');
  const [confirmationModalBody, setConfirmationModalBody] = React.useState<
    string
  >('');

  const [selectedEnv, setSelectedEnv] = React.useState<
    AnsibleExecutionEnv | undefined
  >();

  const organization = useForemanOrganization();

  const executionEnvResponse = useTableIndexAPIResponse<
    GetAnsibleExecutionEnvResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/pulsible/execution_environments${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    ),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: '' },
    setAPIOptions: executionEnvResponse.setAPIOptions,
  });

  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  const refreshRequest = (): void => {
    executionEnvResponse.setAPIOptions(options => ({ ...options }));
  };

  const destroyEnvAction = async (): Promise<void> => {
    if (selectedEnv) {
      try {
        await axios.delete(
          `${foremanUrl('/api/v2/pulsible/execution_environments')}/${
            selectedEnv.id
          }`
        );
        refreshRequest();
      } catch (e) {
        // TODO: Error popup
      }
    }
  };

  const updateEnvAction = async (): Promise<void> => {
    console.log('update', selectedEnv);

    if (selectedEnv) {
      console.log('h');
      try {
        await axios.patch(
          foremanUrl(
            `/api/v2/pulsible/execution_environments/${selectedEnv.id}`
          ),
          {
            execution_environment: {
              name: selectedEnv.name,
              base_image_url: selectedEnv.base_image_url,
              ansible_version: selectedEnv.ansible_version,
              content: selectedEnv.content,
            },
          }
        );
      } catch (e) {
        // TODO: Error popup
      }
    }
  };

  const createEnvAction = async (
    env: AnsibleExecutionEnvCreate
  ): Promise<void> => {
    try {
      await axios.post(foremanUrl('/api/v2/pulsible/execution_environments/'), {
        execution_environment: {
          name: env.name,
          base_image_url: env.base_image_url,
          ansible_version: env.ansible_version,
          content: env.content,
        },
      });
      refreshRequest();
    } catch (e) {
      // TODO: Error popup
    }
  };

  const performAction = (): void => {
    // eslint-disable-next-line default-case
    switch (confirmationModalMode) {
      case 'destroy':
        destroyEnvAction();
        break;
      case 'update':
        updateEnvAction();
        break;
    }
    setIsConfirmationModalOpen(false);
  };

  if (executionEnvResponse.status === 'RESOLVED') {
    if (executionEnvResponse.response.results.length > 0) {
      return (
        <>
          <ExecutionEnvGrid
            apiResponse={executionEnvResponse.response}
            setAPIOptions={executionEnvResponse.setAPIOptions}
            onPagination={onPagination}
            setConfirmationModalMode={setConfirmationModalMode}
            setIsConfirmationModalOpen={setIsConfirmationModalOpen}
            setConfirmationModalTitle={setConfirmationModalTitle}
            setConfirmationModalBody={setConfirmationModalBody}
            selectedEnv={selectedEnv}
            setSelectedEnv={setSelectedEnv}
            createEnvAction={createEnvAction}
          />
          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            title={confirmationModalTitle}
            body={confirmationModalBody}
            onConfirm={performAction}
            onAbort={() => {
              setIsConfirmationModalOpen(false);
            }}
          />
          <ContentUnitModal />
        </>
      );
    }

    return (
      <EmptyPage
        message={{
          type: 'empty',
          text: 'No execution environments found in this organization.',
        }}
      />
    );
  } else if (executionEnvResponse.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage message={{ type: 'loading', text: 'The impostor is sus' }} />
  );
};

export default ExecutionEnvGridWrapper;
