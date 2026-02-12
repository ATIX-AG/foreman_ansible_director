import React, { ReactElement } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

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
import { translate as _ } from 'foremanReact/common/I18n';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import SearchBar from 'foremanReact/components/SearchBar';

import { AnsibleContentTable } from './AnsibleContentTable';
import AnsibleContentWizard from './AnsibleContentWizard/AnsibleContentWizard';
import {
  AnsibleContentUnit,
  AnsibleContentVersion,
} from '../../../types/AnsibleContentTypes';
import { Page } from '../../common/Page';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';

interface AnsibleContentTableWrapperProps {
  initialSearch: string;
}

export interface AnsibleContentVersionWithCount extends AnsibleContentVersion {
  // eslint-disable-next-line camelcase
  roles_count: number;
}
export interface AnsibleContentUnitWithCounts extends AnsibleContentUnit {
  versions: AnsibleContentVersionWithCount[];
}

export interface GetAnsibleContentResponse extends IndexResponse {
  results: AnsibleContentUnitWithCounts[];
}

const AnsibleContentTableWrapper = ({
  initialSearch,
}: AnsibleContentTableWrapperProps): ReactElement | null => {
  const [isContentWizardOpen, setIsContentWizardOpen] = React.useState<boolean>(
    false
  );

  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleContentResponse> = useTableIndexAPIResponse<
    GetAnsibleContentResponse
  >({
    apiUrl: foremanUrl(
      `/api/v2/ansible_director/ansible_content${
        organization ? `?organization_id=${organization.id}&` : ''
      }${`search=${initialSearch}&`}`
    ),
  });

  const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
    defaultParams: { search: initialSearch },
    setAPIOptions: contentRequest.setAPIOptions,
  });

  const refreshRequest = (): void => {
    contentRequest.setAPIOptions(options => ({ ...options }));
  };
  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  const onSearch = (search: string): void => {
    setParamsAndAPI({ ...params, search });
  };

  if (contentRequest.status === 'RESOLVED') {
    return (
      <Page
        header="Ansible Content"
        customToolbarItems={[
          <PermittedButton
            onClick={() => setIsContentWizardOpen(true)}
            requiredPermissions={[AdPermissions.ansibleContent.create]}
          >
            Import Ansible content
          </PermittedButton>,
        ]}
        hasDocumentation={false}
        searchBar={
          <SearchBar
            data={{
              autocomplete: {
                id: 'name',
                url:
                  '/api/v2/ansible_director/ansible_content/auto_complete_search',
                searchQuery: params.search as string,
              },
            }}
            onSearch={onSearch}
            name="ad_acu"
          />
        }
      >
        <>
          {contentRequest.response.results.length > 0 ? (
            <AnsibleContentTable
              apiResponse={contentRequest.response}
              setAPIOptions={contentRequest.setAPIOptions}
              onPagination={onPagination}
              refreshRequest={refreshRequest}
            />
          ) : (
            <EmptyState variant={EmptyStateVariant.xl}>
              <EmptyStateHeader
                headingLevel="h4"
                titleText="No Ansible content in this organization"
                icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
              />
              <EmptyStateBody>
                This organization does not have any Ansible content.
              </EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsContentWizardOpen(true);
                    }}
                  >
                    Import Ansible content
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          )}
          <AnsibleContentWizard
            isContentWizardOpen={isContentWizardOpen}
            setIsContentWizardOpen={setIsContentWizardOpen}
            refreshRequest={refreshRequest}
          />
        </>
      </Page>
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage
      message={{ type: 'loading', text: _('Loading Ansible content...') }}
    />
  );
};

export default AnsibleContentTableWrapper;
