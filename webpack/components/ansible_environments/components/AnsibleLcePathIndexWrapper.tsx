import React from 'react';
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
import { AnsibleLcePath } from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathIndex } from './AnsibleLcePathIndex';

export interface GetAnsibleLcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

const AnsibleContentTableWrapper: React.FC = () => {
  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleLcePathsResponse> = useTableIndexAPIResponse<
    GetAnsibleLcePathsResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/pulsible/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    ),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: '' },
    setAPIOptions: contentRequest.setAPIOptions,
  });

  // eslint-disable-next-line no-unused-vars
  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  const refreshRequest = (): void => {
    contentRequest.setAPIOptions(options => ({ ...options }));
  };

  if (contentRequest.status === 'RESOLVED') {
    return (
      <>
        <AnsibleLcePathIndex
          lcePaths={contentRequest.response.results}
          refreshRequest={refreshRequest}
        />
      </>
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return <EmptyPage message={{ type: 'loading', text: 'Loading...' }} />;
};

export default AnsibleContentTableWrapper;
