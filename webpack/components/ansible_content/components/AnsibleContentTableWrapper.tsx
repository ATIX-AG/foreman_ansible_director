import React, { Dispatch, SetStateAction } from 'react';
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
import { AnsibleContentTable } from './AnsibleContentTable';
import AnsibleContentWizard from './AnsibleContentWizard/AnsibleContentWizard';
import {
  AnsibleContentUnit,
  AnsibleContentVersion,
} from '../../../types/AnsibleContentTypes';

interface AnsibleContentTableWrapperProps {
  isContentWizardOpen: boolean;
  setIsContentWizardOpen: Dispatch<SetStateAction<boolean>>;
}

export interface GetAnsibleContentResponse extends IndexResponse {
  results: AnsibleContentUnit[];
}

export interface AnsibleContentResult {
  name: string;
  namespace: string;
  type: 'collection' | 'role';
  versions: AnsibleContentVersion[];
}

const AnsibleContentTableWrapper: React.FC<AnsibleContentTableWrapperProps> = ({
  isContentWizardOpen,
  setIsContentWizardOpen,
}) => {
  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleContentResponse> = useTableIndexAPIResponse<
    GetAnsibleContentResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible/ansible_content${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    ),
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
        <AnsibleContentWizard
          isContentWizardOpen={isContentWizardOpen}
          setIsContentWizardOpen={setIsContentWizardOpen}
        />
      </>
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage message={{ type: 'loading', text: 'Loading Ansible content' }} />
  );
};

export default AnsibleContentTableWrapper;
