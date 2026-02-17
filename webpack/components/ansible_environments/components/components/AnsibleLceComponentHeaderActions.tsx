import React from 'react';

import { Icon } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import AnsibleTowerIcon from '@patternfly/react-icons/dist/esm/icons/ansible-tower-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';
import { PermittedButton } from '../../../common/PermittedButton';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';

interface AnsibleLceComponentHeaderActionsProps {
  lce: AnsibleLce;
  pathEditMode: boolean;
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: () => Promise<void>;
  handleEditContent: () => void;
}

export const AnsibleLceComponentHeaderActions: React.FC<AnsibleLceComponentHeaderActionsProps> = ({
  lce,
  pathEditMode,
  editMode,
  handleEdit,
  handleDestroy,
  handleEditContent,
}) => (
  <>
    <PermittedButton
      requiredPermissions={[AdPermissions.ansibleLce.edit]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'ansible content popover',
        headerComponent: 'h1',
        headerContent: _('Manage Ansible content'),
        bodyContent: <div>{_('Add, remove, and update Ansible content.')}</div>,
      }}
      variant="plain"
      aria-label="Action"
      onClick={() => handleEditContent()}
      isDisabled={lce.position !== 0}
    >
      <Icon size="md">
        <AnsibleTowerIcon />
      </Icon>
    </PermittedButton>

    {pathEditMode && (
      <>
        <PermittedButton
          requiredPermissions={[AdPermissions.ansibleLce.destroy]}
          hasPopover
          popoverProps={{
            triggerAction: 'hover',
            'aria-label': 'destroy popover',
            headerComponent: 'h1',
            headerContent: _('Delete'),
            bodyContent: <div>{_('Delete this lifecycle environment.')}</div>,
          }}
          variant="plain"
          aria-label="Action"
          onClick={() => handleDestroy()}
        >
          <Icon size="md">
            <TrashIcon />
          </Icon>
        </PermittedButton>

        <PermittedButton
          requiredPermissions={[AdPermissions.ansibleLce.edit]}
          hasPopover
          popoverProps={{
            triggerAction: 'hover',
            'aria-label': 'edit popover',
            headerComponent: 'h1',
            headerContent: _('Edit'),
            bodyContent: <div>{_('Edit this lifecycle environment.')}</div>,
          }}
          variant="plain"
          aria-label="Action"
          onClick={handleEdit}
        >
          {editMode ? (
            <Icon size="md">
              <SaveIcon />
            </Icon>
          ) : (
            <Icon size="md">
              <EditIcon />
            </Icon>
          )}
        </PermittedButton>
      </>
    )}
  </>
);
