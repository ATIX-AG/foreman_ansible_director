import { Icon } from '@patternfly/react-core';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import React from 'react';
import { PermittedButton } from '../../../../common/PermittedButton';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';

interface HostDetailsLceCardHeaderActionsProps {
  isEditMode: boolean;
  handleEdit: () => void;
}

export const HostDetailsLceCardHeaderActions: React.FC<HostDetailsLceCardHeaderActionsProps> = ({
  isEditMode,
  handleEdit,
}) => (
  <>
    <PermittedButton
      requiredPermissions={[AdPermissions.assignments.create]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'edit host lce popover',
        headerComponent: 'h1',
        headerContent: 'Edit LCE assignment',
        bodyContent: (
          <div>Set the lifecycle environment this host belongs to.</div>
        ),
      }}
      variant="plain"
      aria-label="Action"
      onClick={handleEdit}
    >
      {isEditMode ? (
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
