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
import { translate as _ } from 'foremanReact/common/I18n';

import { AnsibleLcePath } from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathIndex } from './AnsibleLcePathIndex';
import { Page } from '../../common/Page';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { PermittedButton } from '../../common/PermittedButton';

export interface GetAnsibleLcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

const AnsibleContentTableWrapper: React.FC = () => {
  const organization = useForemanOrganization();

  const [isCreateButtonLoading, setIsCreateButtonLoading] = React.useState<
    boolean
  >(false);

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

  const toolbarItems = (): ReactElement[] => [
    <PermittedButton
      onClick={() => createLcePath()}
      requiredPermissions={[AdPermissions.ansibleLcePaths.create]}
      isLoading={isCreateButtonLoading}
    >
      {_('Create lifecycle environment path')}
    </PermittedButton>,
  ];

  if (contentRequest.status === 'RESOLVED') {
    return (
      <>
        <Page
          header={_('Ansible environments')}
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

  return <EmptyPage message={{ type: 'loading', text: _('Loading...') }} />;
};

export default AnsibleContentTableWrapper;
