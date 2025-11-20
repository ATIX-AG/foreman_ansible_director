import React from 'react';
import axios, { AxiosResponse } from 'axios';
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
import { addToast } from 'foremanReact/components/ToastsList';
import { useDispatch } from 'react-redux';
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
    AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined
  >();

  const [isContentUnitModalOpen, setIsIsContentUnitModalOpen] = React.useState<
    boolean
  >(false);

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  const executionEnvResponse = useTableIndexAPIResponse<
    GetAnsibleExecutionEnvResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible_director/execution_environments${
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
    if (selectedEnv && 'id' in selectedEnv) {
      try {
        await axios.delete(
          `${foremanUrl('/api/v2/ansible_director/execution_environments')}/${
            selectedEnv.id
          }`
        );
        dispatch(
          addToast({
            type: 'success',
            key: `DESTROY_EE_${selectedEnv.name}_SUCC`,
            message: `Successfully destroyed Ansible execution environment "${selectedEnv.name}"!`,
            sticky: false,
          })
        );
        refreshRequest();
      } catch (e) {
        dispatch(
          addToast({
            type: 'danger',
            key: `DESTROY_EE_${selectedEnv.name}_ERR`,
            message: `Destruction of Ansible execution environment "${
              selectedEnv.name
            }" failed with error code "${
              (e as { response: AxiosResponse }).response.status
            }".`,
            sticky: false,
          })
        );
      }
    }
  };

  const updateEnvAction = async (): Promise<void> => {
    if (selectedEnv && 'id' in selectedEnv) {
      try {
        await axios.patch(
          foremanUrl(
            `/api/v2/ansible_director/execution_environments/${selectedEnv.id}`
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
        dispatch(
          addToast({
            type: 'success',
            key: `UPDATE_EE_${selectedEnv.name}_SUCC`,
            message: `Successfully updated Ansible execution environment "${selectedEnv.name}"!`,
            sticky: false,
          })
        );
      } catch (e) {
        dispatch(
          addToast({
            type: 'danger',
            key: `UPDATE_EE_${selectedEnv.name}_ERR`,
            message: `Updating of Ansible execution environment "${
              selectedEnv.name
            }" failed with error code "${
              (e as { response: AxiosResponse }).response.status
            }".`,
            sticky: false,
          })
        );
      }
    }
  };

  const createEnvAction = async (
    env: AnsibleExecutionEnvCreate
  ): Promise<void> => {
    try {
      await axios.post(
        foremanUrl('/api/v2/ansible_director/execution_environments/'),
        {
          execution_environment: {
            name: env.name,
            base_image_url: env.base_image_url,
            ansible_version: env.ansible_version,
            content: env.content,
          },
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `CREATE_EE_${env.name}_SUCC`,
          message: `Successfully created Ansible execution environment "${env.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `CREATE_EE_${env.name}_ERR`,
          message: `Creation of Ansible execution environment "${
            env.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
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
    if (executionEnvResponse.response.results.length > -1) {
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
            setIsContentUnitModalOpen={setIsIsContentUnitModalOpen}
          />
          <ConfirmationModal
            isConfirmationModalOpen={isConfirmationModalOpen}
            setIsConfirmationModalOpen={setIsConfirmationModalOpen}
            title={confirmationModalTitle}
            body={confirmationModalBody}
            onConfirm={performAction}
          />
          {selectedEnv && (
            <ContentUnitModal
              isContentUnitModalOpen={isContentUnitModalOpen}
              setIsContentUnitModalOpen={setIsIsContentUnitModalOpen}
              target={selectedEnv}
              setTarget={setSelectedEnv}
              refreshRequest={refreshRequest}
            />
          )}
        </>
      );
    }
  } else if (executionEnvResponse.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage
      message={{ type: 'loading', text: 'Loading Execution Environments...' }}
    />
  );
};

export default ExecutionEnvGridWrapper;
