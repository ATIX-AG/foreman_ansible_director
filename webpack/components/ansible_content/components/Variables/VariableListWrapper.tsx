import React, { ReactElement } from 'react';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { Bullseye, EmptyState, EmptyStateHeader, EmptyStateIcon, Spinner } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { foremanUrl } from 'foremanReact/common/helpers';
import { DefaultResponse } from '../../../../types/common';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';
import { ManagementDrawer } from './ManagementDrawer';
import { CollectionRoleAssignable } from '../../../../types/DynamicAssignmentTypes';

interface VariableListWrapperProps {
  assignable: CollectionRoleAssignable;
  roleId: number;
}

interface GetAcrVariablesResponse {
  variables: AnsibleVariable[];
}

export const VariableListWrapper = ({
  assignable,
  roleId,
}: VariableListWrapperProps): ReactElement => {

  const acrVariablesRequest = useAPI<DefaultResponse<never, never, GetAcrVariablesResponse>>('get', foremanUrl(
    `/api/v2/ansible_director/ansible_content/collection_roles/${roleId}/variables`
  ));

  const refreshRequest = (): void => {
    acrVariablesRequest.setAPIOptions(options => ({ ...options }));
  };

  if (acrVariablesRequest.status === 'RESOLVED') {
    return (
      <ManagementDrawer
        assignable={assignable}
        variables={acrVariablesRequest.response.results.variables}
        onDrawerClose={refreshRequest}
      />
    );
  }

  if (acrVariablesRequest.status === 'ERROR') {
    // TODO: Handle error
  }

  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateHeader
          titleText={_('Loading variables...')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>
    </Bullseye>
  );

};
