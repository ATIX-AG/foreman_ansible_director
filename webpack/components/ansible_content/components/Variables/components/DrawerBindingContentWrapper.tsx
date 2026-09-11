import { EmptyState, EmptyStateHeader, EmptyStateIcon, Spinner } from '@patternfly/react-core';
import React, { MutableRefObject, ReactElement } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleVariable, AnsibleVariableBinding } from '../../../../../types/AnsibleVariableTypes';
import { DefaultResponse } from '../../../../../types/common';
import { DrawerBindingContent } from './DrawerBindingContent';
import { CollectionRoleAssignable } from '../../../../../types/DynamicAssignmentTypes';

interface DrawerBindingContentWrapperProps {
  assignable: CollectionRoleAssignable;
  drawerRef: MutableRefObject<HTMLElement | undefined>;
  variable: AnsibleVariable;
  onCloseClick: () => void;
}

interface BindingIndexResponse {
  bindings: AnsibleVariableBinding[];
}

export const DrawerBindingContentWrapper = ({
  assignable,
  variable,
  drawerRef,
  onCloseClick,
}: DrawerBindingContentWrapperProps): ReactElement => {

  const getBindingsRequest = useAPI<DefaultResponse<never, never, BindingIndexResponse>>(
    'get',
    `/api/v2/ansible_director/ansible_variables/${variable.id}/bindings`
  );

  const refreshRequest = (): void => {
    getBindingsRequest.setAPIOptions(options => ({ ...options }));
  };

  if (getBindingsRequest.status === 'ERROR') {
    // TODO: Handle error
  } else if (getBindingsRequest.status === 'RESOLVED') {
    return (
      <DrawerBindingContent
        assignable={assignable}
        drawerRef={drawerRef}
        variable={variable}
        bindings={getBindingsRequest.response.results.bindings}
        onCloseClick={onCloseClick}
        onSuccess={refreshRequest}
      />
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_(`Loading Ansible variable bindings for ${variable.name}...`)}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );

};
