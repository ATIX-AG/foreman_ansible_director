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
import { AnsibleContentTable } from './AnsibleContentTable';
import AnsibleContentWizard from './AnsibleContentWizard/AnsibleContentWizard';
import { AnsibleContentVersion } from '../../../types/AnsibleContentTypes';

export interface GetAnsibleContentResponse extends IndexResponse {
  results: AnsibleContentResult[];
}

export interface AnsibleContentResult {
  name: string;
  namespace: string;
  type: 'collection' | 'role';
  versions: AnsibleContentVersion[];
}

const AnsibleContentTableWrapper: React.FC = () => {
  const contentRequest: UseAPIReturn<GetAnsibleContentResponse> = useTableIndexAPIResponse<
    GetAnsibleContentResponse
  >({
    apiUrl: foremanUrl('/api/v2/pulsible/ansible_content'),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: '' },
    setAPIOptions: contentRequest.setAPIOptions,
  });

  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  if (contentRequest.status === 'RESOLVED') {
    return (
      <>
        <AnsibleContentTable
          apiResponse={contentRequest.response}
          setAPIOptions={contentRequest.setAPIOptions}
          onPagination={onPagination}
        />
        <AnsibleContentWizard />
      </>
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage message={{ type: 'loading', text: 'The impostor is sus' }} />
  );
};

export default AnsibleContentTableWrapper;
