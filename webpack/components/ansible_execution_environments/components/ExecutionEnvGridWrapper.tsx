import React, { ReactElement } from 'react';
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
import { translate as _ } from 'foremanReact/common/I18n';

import { useDispatch } from 'react-redux';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { ExecutionEnvGrid } from '../ExecutionEnvGrid';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ContentUnitModal } from './ContentUnitModal';

export interface GetAnsibleExecutionEnvResponse extends IndexResponse {
  results: AnsibleExecutionEnv[];
}

interface ExecutionEnvGridWrapperProps {
  initialSearch: string;
}

const ExecutionEnvGridWrapper = ({
  initialSearch,
}: ExecutionEnvGridWrapperProps): ReactElement | null => {
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
      }search=${initialSearch}&`
    ),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: initialSearch },
    setAPIOptions: executionEnvResponse.setAPIOptions,
  });

  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  const onSearch = (search: string): void => {
    setParamsAndAPI({ ...params, search });
  };

  const refreshRequest = (): void => {
    executionEnvResponse.setAPIOptions(options => ({ ...options }));
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
          message: `Successfully created Ansible Execution Environment "${env.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `CREATE_EE_${env.name}_ERR`,
          message: `Creation of Ansible Execution Environment "${
            env.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  if (executionEnvResponse.status === 'RESOLVED') {
    if (executionEnvResponse.response.results.length > -1) {
      return (
        <>
          <ExecutionEnvGrid
            apiResponse={executionEnvResponse.response}
            onPagination={onPagination}
            search={params.search as string}
            onSearch={onSearch}
            setSelectedEnv={setSelectedEnv}
            createEnvAction={createEnvAction}
            setIsContentUnitModalOpen={setIsIsContentUnitModalOpen}
            refreshRequest={refreshRequest}
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
      message={{
        type: 'loading',
        text: _('Loading Ansible Execution Environments...'),
      }}
    />
  );
};

export default ExecutionEnvGridWrapper;
