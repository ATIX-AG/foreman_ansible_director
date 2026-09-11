import React, { ReactElement } from 'react';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { EmptyState, EmptyStateHeader, EmptyStateIcon, Spinner } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { DefaultResponse } from '../../../../types/common';
import { AnsibleCollectionRoleWithVarCount } from '../../../../types/AnsibleContentTypes';
import { CollectionRoleOverview } from './CollectionRoleOverview';
import { AnsibleContentUnitWithCounts, AnsibleContentVersionWithCount } from '../AnsibleContentTableWrapper';

interface CollectionOverviewWrapperProps {
  node: { node: AnsibleContentUnitWithCounts; version: AnsibleContentVersionWithCount };
}

interface GetAcrDetailsResponse {
  collection_roles: AnsibleCollectionRoleWithVarCount[];
}

export const CollectionOverviewWrapper = ({ node }: CollectionOverviewWrapperProps): ReactElement => {

  const acrDetailsRequest = useAPI<DefaultResponse<never, never, GetAcrDetailsResponse>>(
    'get',
    foremanUrl(`/api/v2/ansible_director/ansible_content/${node.version.id}`)
  );

  if (acrDetailsRequest.status === 'ERROR') {
    // TODO: Handle error
  }
  else if (acrDetailsRequest.status === 'RESOLVED') {
    return (
      <CollectionRoleOverview
        collectionName={node.node.name}
        collectionNamespace={node.node.namespace}
        collectionRoles={acrDetailsRequest.response.results.collection_roles}
      />
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading collection details...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );

};
