import React, { ReactElement } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';

import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { addToast } from 'foremanReact/components/ToastsList';

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
  ResolvedAssignment,
} from '../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString, crnTypeUrlMap } from '../helpers';

interface AssignmentSelectorWrapperProps {
  crnId: number;
  crnType: ContentResolutionNodeType;
  crnName: string;
  csId: number;
  excludeAssignments: ResolvedAssignment<AnsibleContentAssignment>[];
  onClose: () => void;
  onAbort: () => void;
  onSuccess: () => void;
}

export const AssignmentSelectorWrapper = ({
  crnId,
  crnType,
  crnName,
  csId,
  excludeAssignments,
  onAbort,
  onClose,
  onSuccess,
}: AssignmentSelectorWrapperProps): ReactElement => {
  const [selectedAssignables, setSelectedAssignables] = React.useState<
    AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]
  >([]);

  const dispatch = useDispatch();

  const getAvailableContentRequest: UseAPIReturn<DenseAnsibleLce> = useAPI<
    DenseAnsibleLce
  >(
    'get',
    foremanUrl(`/api/v2/ansible_director/lifecycle_environments/${csId}/`)
  );

  const handleAssignmentConfirm = async (): Promise<void> => {
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible_director/assignments/${crnTypeUrlMap[crnType]}/${crnId}`
        ),
        { assignments: selectedAssignables }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `CREATE_ASSIGNMENTS_${crnType}_${crnId}_SUCC`,
          message: __(
            _(
              `Successfully assigned %(count)s ${
                selectedAssignables.length > 1 ? 'roles' : 'role'
              } to %(target)s!`
            ),
            {
              count: selectedAssignables.length,
              target: crnName,
            }
          ),
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `CREATE_ASSIGNMENTS_${crnType}_${crnId}_ERR`,
          message: __(
            _(
              'Assigning Ansible roles to %(target)s failed with error code "%(error)s".'
            ),
            {
              target: crnName,
              error: (e as { response: AxiosResponse }).response.status,
            }
          ),
          sticky: false,
        })
      );
    }
  };

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
              await handleAssignmentConfirm();
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
          availableContent={getAvailableContentRequest.response.content}
          excludeAssignments={excludeAssignments}
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
