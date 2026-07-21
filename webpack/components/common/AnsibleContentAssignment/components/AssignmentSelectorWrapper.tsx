import React, { ReactElement, useContext } from 'react';

import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';

import { foremanUrl } from 'foremanReact/common/helpers';
import { DenseAnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';
import { AssignmentSelector } from './AssignmentSelector';
import {
  AnsibleContentAssignment,
  AnsibleContentAssignmentCreate,
  ContentResolutionNodeType,
} from '../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString, crnTypeUrlMap } from '../helpers';
import { AssignmentContext } from '../AssignmentContext';
import { DefaultResponse } from '../../../../types/common';

interface AssignmentSelectorWrapperProps {
  crnType: ContentResolutionNodeType;
  csId: number;
  onClose: () => void;
  onAbort: () => void;
  onSuccess: () => void;
}

export const AssignmentSelectorWrapper = ({
  crnType,
  csId,
  onAbort,
  onClose,
  onSuccess,
}: AssignmentSelectorWrapperProps): ReactElement | null => {
  const [selectedAssignables, setSelectedAssignables] = React.useState<
    AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]
  >([]);

  const assignmentCtx = useContext(AssignmentContext);

  if (assignmentCtx === null) {
    return null;
  }

  const getAvailableContentRequest: UseAPIReturn<DefaultResponse<never, never, DenseAnsibleLce>> = useAPI<
    DefaultResponse<never, never, DenseAnsibleLce>
  >(
    'get',
    foremanUrl(`/api/v2/ansible_director/lifecycle_environments/${csId}/`)
  );

  if (getAvailableContentRequest.status === 'RESOLVED') {
    return (
      <Modal
        variant={ModalVariant.medium}
        isOpen
        title={__(_('Assign Ansible content to this %(targetType)s'), {
          targetType: crnTypeUiString[crnType],
        })}
        onClose={onClose}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={async () => {
              await assignmentCtx.handleAssignmentCreate(selectedAssignables);
              onSuccess();
            }}
          >
            {_('Confirm')}
          </Button>,
          <Button key="cancel" variant="link" onClick={onAbort}>
            {_('Cancel')}
          </Button>,
        ]}
      >
        <AssignmentSelector
          availableContent={getAvailableContentRequest.response.results.content}
          selected={selectedAssignables}
          onChange={newAssignables => setSelectedAssignables(newAssignables)}
        />
      </Modal>
    );
  } else if (getAvailableContentRequest.status === 'ERROR') {
    // TODO: Handle
  }

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen
      title={__(_('Assign Ansible content to this %(targetType)s'), {
        targetType: crnTypeUiString[crnType],
      })}
    >
      <EmptyState>
        <EmptyStateHeader
          titleText={_('Loading lifecycle environment content...')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>
    </Modal>
  );
};
