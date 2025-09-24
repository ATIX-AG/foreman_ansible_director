import React, { ReactElement } from 'react';
import axios from 'axios';
import {
  IndexResponse,
  PaginationProps,
  UseAPIReturn,
} from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import {
  useSetParamsAndApiAndSearch,
  useTableIndexAPIResponse,
} from 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';

import { Page } from '../common/Page';
import { AnsibleTasksTable } from './components/AnsibleTasksTable';
import { AnsibleTask } from '../../types/AnsibleTasksTypes';

export interface GetAnsibleTasksResponse extends IndexResponse {
  results: AnsibleTask[];
}

export const AnsibleTasksPage = (): ReactElement | null => {
  const organization = useForemanOrganization();

  const tasksRequest: UseAPIReturn<GetAnsibleTasksResponse> = useTableIndexAPIResponse<
    GetAnsibleTasksResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible/tasks/?${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    ),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: '' },
    setAPIOptions: tasksRequest.setAPIOptions,
  });

  // eslint-disable-next-line no-unused-vars
  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  // eslint-disable-next-line no-unused-vars
  const refreshRequest = (): void => {
    tasksRequest.setAPIOptions(options => ({ ...options }));
  };

  if (tasksRequest.status === 'RESOLVED') {
    return (
      <>
        <Page
          header="Ansible Tasks"
          customToolbarItems={[]}
          hasDocumentation={false}
        >
          <AnsibleTasksTable tasks={tasksRequest.response.results} />
        </Page>
      </>
    );
  } else if (tasksRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return <EmptyPage message={{ type: 'loading', text: 'Loading...' }} />;
};
