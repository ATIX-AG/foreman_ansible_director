import React from 'react';
import { Icon } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { AnsibleLcePath } from '../../../../types/AnsibleEnvironmentsTypes';
import { PermittedButton } from '../../../common/PermittedButton';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';

interface AnsibleLcePathComponentHeaderActionsProps {
  lcePath: AnsibleLcePath;
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: (lcePath: AnsibleLcePath) => void;
}

export const AnsibleLcePathComponentHeaderActions: React.FC<AnsibleLcePathComponentHeaderActionsProps> = ({
  lcePath,
  editMode,
  handleEdit,
  handleDestroy,
}) => (
  <>
    {lcePath.description !== '' && (
      <PermittedButton
        requiredPermissions={[AdPermissions.ansibleLcePaths.edit]}
        hasPopover
        popoverProps={{
          triggerAction: 'hover',
          'aria-label': 'description popover',
          headerComponent: 'h1',
          headerContent: 'Description',
          bodyContent: <div>{lcePath.description}</div>,
        }}
        variant="plain"
        aria-label="Action"
      >
        <Icon size="lg">
          <InfoCircleIcon />
        </Icon>
      </PermittedButton>
    )}
    <PermittedButton
      requiredPermissions={[AdPermissions.ansibleLcePaths.destroy]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'destroy popover',
        headerComponent: 'h1',
        headerContent: 'Destroy',
        bodyContent: <div>Destroy this Lifecycle Environment Path.</div>,
      }}
      variant="plain"
      aria-label="Action"
      onClick={() => handleDestroy(lcePath)}
    >
      <Icon size="lg">
        <TrashIcon />
      </Icon>
    </PermittedButton>
    <PermittedButton
      requiredPermissions={[AdPermissions.ansibleLcePaths.edit]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'edit popover',
        headerComponent: 'h1',
        headerContent: 'Edit',
        bodyContent: <div>Edit this Lifecycle Environment Path.</div>,
      }}
      variant="plain"
      aria-label="Action"
      onClick={handleEdit}
    >
      {editMode ? (
        <Icon size="lg">
          <SaveIcon />
        </Icon>
      ) : (
        <Icon size="lg">
          <EditIcon />
        </Icon>
      )}
    </PermittedButton>
  </>
);
