import React, { ReactElement } from 'react';
import axios from 'axios';
import {
  IndexResponse,
  PaginationProps,
  UseAPIReturn,
} from 'foremanReact/common/hooks/API/APIHooks';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import {
  useSetParamsAndApiAndSearch,
  useTableIndexAPIResponse,
} from 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { Button } from '@patternfly/react-core';

import { AnsibleLcePath } from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathIndex } from './AnsibleLcePathIndex';
import { Page } from '../../common/Page';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';

export interface GetAnsibleLcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

const AnsibleContentTableWrapper: React.FC = () => {
  const organization = useForemanOrganization();

  const [isCreateButtonLoading, setIsCreateButtonLoading] = React.useState<
    boolean
  >(false);

  const canCreatePath: boolean = usePermissions([
    AdPermissions.ansibleLcePaths.create,
  ]);

  const createLcePath = async (): Promise<void> => {
    setIsCreateButtonLoading(true);
    try {
      await axios.post(
        foremanUrl('/api/v2/ansible_director/lifecycle_environments/paths'),
        {
          lifecycle_environment_path: {
            name: 'Unnamed LCE Path',
            description: '',
          },
          organization_id: organization?.id,
        }
      );
    } catch (e) {
      // TODO: Handle error
    } finally {
      setIsCreateButtonLoading(false);
      refreshRequest();
    }
  };
  const contentRequest: UseAPIReturn<GetAnsibleLcePathsResponse> = useTableIndexAPIResponse<
    GetAnsibleLcePathsResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible_director/lifecycle_environments/paths?order=name&${
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

  const toolbarItems = (): ReactElement[] => {
    if (canCreatePath) {
      return [
        <Button
          onClick={() => createLcePath()}
          isLoading={isCreateButtonLoading}
        >
          Create LCE Path
        </Button>,
      ];
    }
    return [];
  };

  if (contentRequest.status === 'RESOLVED') {
    return (
      <>
        <Page
          header="Ansible Environments"
          customToolbarItems={toolbarItems()}
          hasDocumentation={false}
        >
          <AnsibleLcePathIndex
            lcePaths={contentRequest.response.results}
            refreshRequest={refreshRequest}
          />
        </Page>
      </>
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return <EmptyPage message={{ type: 'loading', text: 'Loading...' }} />;
};

export default AnsibleContentTableWrapper;
