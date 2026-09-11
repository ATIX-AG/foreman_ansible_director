import React, { ReactElement, useContext } from 'react';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { EmptyState, EmptyStateHeader, EmptyStateIcon, Modal, ModalVariant, Spinner } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { AnsibleVariable, AnsibleVariableBinding } from '../../../../../../types/AnsibleVariableTypes';
import { AnsibleContentAssignment, ContentResolutionNode } from '../../../../../../types/AnsibleContentAssignmentTypes';
import { DefaultResponse } from '../../../../../../types/common';
import { isCollectionRoleAssignment } from '../../../../../../helpers/typeGuards/contentAssignmentTypeGuards';
import { BindingDetailModal } from './BindingDetailModal';
import { AssignmentContext } from '../../../AssignmentContext';
import { crnTypeUrlMap } from '../../../helpers';

export type HierarchicalBinding = {
  binding: AnsibleVariableBinding | null;
  content_resolution_node: ContentResolutionNode;
};

interface BindingDetailModalWrapperProps {
  variable: AnsibleVariable;
  assignment: AnsibleContentAssignment;
  onClose: () => void;
}

type ResolveBindingsResponse = DefaultResponse<never, never, {
  variable: AnsibleVariable;
  bindings: HierarchicalBinding[];
}>;

export const BindingDetailModalWrapper = ({
  variable,
  assignment,
  onClose,
}: BindingDetailModalWrapperProps): ReactElement | null => {

  const assignmentCtx = useContext(AssignmentContext);

  if (assignmentCtx === null) {
    return null;
  }

  const getResolvedBindingsResponse = useAPI<ResolveBindingsResponse>(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/ansible_variables/${crnTypeUrlMap[assignmentCtx.crnType]}/${assignmentCtx.crnId}/single`
    ),
    {
      params: {
        assignable_type: assignment.assignable_type,
        assignable_namespace: assignment.assignable_namespace,
        assignable_name: assignment.assignable_name,
        assignable_role_name: isCollectionRoleAssignment(assignment) ? assignment.assignable_role_name : null,
        variable_name: variable.name,
      },
    }
  );

  if (getResolvedBindingsResponse.status === 'ERROR') {
    // TODO: Handle
  }

  else if (getResolvedBindingsResponse.status === 'RESOLVED') {
    return (
      <BindingDetailModal
        variable={getResolvedBindingsResponse.response.results.variable}
        hierarchicalBindings={getResolvedBindingsResponse.response.results.bindings}
        onClose={onClose}
        onConfirmSuccess={() => getResolvedBindingsResponse.setAPIOptions(options => ({ ...options }))}
      />
    );
  }

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen
    >
      <EmptyState>
        <EmptyStateHeader
          titleText={_('Loading variable bindings...')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>
    </Modal>
  );

};
