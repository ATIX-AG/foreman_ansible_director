import React, { ReactElement } from 'react';
import {
  Modal,
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  ModalVariant,
} from '@patternfly/react-core';
import { IAction } from '@patternfly/react-table';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleRole } from '../../../../types/AnsibleContentTypes';
import { AnsibleVariablesSelector } from './AnsibleVariablesSelector';

interface AnsibleVariablesDetailProps {
  selectedVersionId: string;
  selectedVersion: string;
  selectedIdentifier: string;
  onClose: () => void;
}

interface RolesRequest {
  roles: AnsibleRole[];
}

export const AnsibleVariablesDetail = ({
  selectedVersionId,
  selectedVersion,
  selectedIdentifier,
  onClose,
}: AnsibleVariablesDetailProps): ReactElement | null => {
  const rolesRequest = useAPI<RolesRequest>(
    'get',
    foremanUrl(`/api/v2/ansible/ansible_content/${selectedVersionId}`)
  );

  const modal = (
    modalContent: ReactElement,
    showControl: boolean
  ): ReactElement => {
    let actions: IAction[] = [];
    if (showControl) {
      actions = [
        <Button key="confirm" variant="primary" onClick={() => {}}>
          Confirm
        </Button>,
        <Button key="cancel" variant="link" onClick={() => {}}>
          Cancel
        </Button>,
      ];
    }

    return (
      <React.Fragment>
        <Modal
          title={`Collection overview: ${selectedIdentifier}:${selectedVersion}`}
          isOpen
          onClose={onClose}
          actions={actions}
          ouiaId="BasicModal"
          variant={ModalVariant.large}
        >
          {modalContent}
        </Modal>
      </React.Fragment>
    );
  };

  if (rolesRequest.status === 'RESOLVED') {
    return modal(
      <AnsibleVariablesSelector ansibleRoles={rolesRequest.response.roles} />,
      false
    );
  } else if (rolesRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  } else if (rolesRequest.status === 'PENDING') {
    return modal(
      <EmptyState>
        <EmptyStateHeader
          titleText="Loading Task steps..."
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>,
      false
    );
  }

  return null;
};
