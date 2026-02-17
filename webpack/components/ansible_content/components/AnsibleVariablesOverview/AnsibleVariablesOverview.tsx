import React, { Dispatch, ReactElement, SetStateAction } from 'react';
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
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { AnsibleRole } from '../../../../types/AnsibleContentTypes';
import { AnsibleVariablesSelector } from './AnsibleVariablesSelector';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';

interface AnsibleVariablesDetailProps {
  selectedVersionId: string;
  selectedVersion: string;
  selectedIdentifier: string;
  onClose: () => void;
  setSelectedVariable: Dispatch<SetStateAction<AnsibleVariable | undefined>>;
}

interface RolesRequest {
  roles: AnsibleRole[];
}

export const AnsibleVariablesOverview = ({
  selectedVersionId,
  selectedVersion,
  selectedIdentifier,
  onClose,
  setSelectedVariable,
}: AnsibleVariablesDetailProps): ReactElement | null => {
  const rolesRequest = useAPI<RolesRequest>(
    'get',
    foremanUrl(`/api/v2/ansible_director/ansible_content/${selectedVersionId}`)
  );

  const modal = (
    modalContent: ReactElement,
    showControl: boolean
  ): ReactElement => {
    let actions: IAction[] = [];
    if (showControl) {
      actions = [
        <Button key="confirm" variant="primary" onClick={() => {}}>
          {_('Submit')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => {}}>
          {_('Cancel')}
        </Button>,
      ];
    }

    return (
      <React.Fragment>
        <Modal
          title={__(_('Collection overview: %(id)s'), {
            id: `${selectedIdentifier}:${selectedVersion}`,
          })}
          isOpen
          onClose={onClose}
          actions={actions}
          ouiaId="BasicModal"
          variant={ModalVariant.large}
          style={{ minHeight: '400px' }}
        >
          {modalContent}
        </Modal>
      </React.Fragment>
    );
  };

  if (rolesRequest.status === 'RESOLVED') {
    return modal(
      <AnsibleVariablesSelector
        ansibleRoles={rolesRequest.response.roles}
        setSelectedVariable={setSelectedVariable}
      />,
      false
    );
  } else if (rolesRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  } else if (rolesRequest.status === 'PENDING') {
    return modal(
      <EmptyState>
        <EmptyStateHeader
          titleText={_('Loading Ansible roles...')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>,
      false
    );
  }

  return null;
};
