import React, { ReactElement } from 'react';
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
import { translate as _ } from 'foremanReact/common/I18n';

import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import SearchBar from 'foremanReact/components/SearchBar';
import { ExecutionEnvGrid } from '../ExecutionEnvGrid';
import {
  ExecutionEnvironment,
  ExecutionEnvironmentDraft,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvironment as ExecutionEnvironmentClient } from '../../../resources/clients/ExecutionEnvironment';
import { useToasts } from '../../../helpers/toasts/useToasts';
import { Page } from '../../common/Page';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { ExecutionEnvImportModal } from './ExecutionEnvImportModal';

export interface GetAnsibleExecutionEnvResponse extends IndexResponse {
  results: ExecutionEnvironment[];
}

interface ExecutionEnvGridWrapperProps {
  initialSearch: string;
}

const ExecutionEnvGridWrapper = ({
  initialSearch,
}: ExecutionEnvGridWrapperProps): ReactElement | null => {

  const [isImportModalOpen, setIsImportModalOpen] = React.useState<boolean>(false);

  const organization = useForemanOrganization();
  const { withToast } = useToasts();

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
    draft: ExecutionEnvironmentDraft
  ): Promise<void> => {
    await withToast({
      type: 'create',
      resource: 'execution_environment',
      func: ExecutionEnvironmentClient.create({
        organization_id: organization.id,
        execution_environment: draft,
      }),
    });
    refreshRequest();
  };

  if (executionEnvResponse.status === 'RESOLVED') {
    if (executionEnvResponse.response.results.length > -1) {
      return (

        <Page
          header={_('Ansible Execution Environments')}
          customToolbarItems={[
            <PermittedButton
              onClick={() => setIsImportModalOpen(true)}
              requiredPermissions={[AdPermissions.executionEnvironments.create]}
              variant={'secondary'}
            >
              {_('Import Execution Environment')}
            </PermittedButton>,
          ]}
          hasDocumentation={false}
          searchBar={
            <SearchBar
              data={{
                autocomplete: {
                  id: 'name',
                  url: '/api/v2/ansible_director/execution_environments/auto_complete_search',
                  searchQuery: params.search as string,
                },
              }}
              onSearch={onSearch}
              name="ad_execution_environment"
            />
          }
        >
          <>
            <ExecutionEnvGrid
              apiResponse={executionEnvResponse.response}
              onPagination={onPagination}
              search={params.search as string}
              onSearch={onSearch}
              createEnvAction={createEnvAction}
              refreshRequest={refreshRequest}
              onImportButtonClick={() => setIsImportModalOpen(true)}
            />
            {isImportModalOpen && (
              <ExecutionEnvImportModal
                onAbort={() => setIsImportModalOpen(false)}
                onImportSuccess={() => {
                  setIsImportModalOpen(false);
                  refreshRequest();
                }}
              />
            )}
          </>
        </Page>
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
