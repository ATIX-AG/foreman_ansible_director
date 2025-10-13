import React, { Dispatch, SetStateAction } from 'react';

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

  const refreshRequest = (): void => {
    contentRequest.setAPIOptions(options => ({ ...options }));
  };
  const onPagination = (newPagination: PaginationProps): void => {
    setParamsAndAPI({ ...params, ...newPagination });
  };

  if (contentRequest.status === 'RESOLVED') {
    return (
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
    );
  } else if (contentRequest.status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage message={{ type: 'loading', text: 'Loading Ansible content' }} />
  );
};

export default AnsibleContentTableWrapper;
