import React from 'react';

import { Button, Icon, Popover } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import AnsibleTowerIcon from '@patternfly/react-icons/dist/esm/icons/ansible-tower-icon';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';

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
    <Popover
      triggerAction="hover"
      aria-label="ansible content popover"
      headerContent={<div>Manage Ansible content</div>}
      bodyContent={
        <div>
          Manage Ansible content for Lifecycle Environment{' '}
          <strong>{lce.name}</strong>.
        </div>
      }
    >
      <Button
        variant="plain"
        aria-label="Action"
        onClick={() => handleEditContent()}
        isDisabled={lce.position !== 0}
      >
        <Icon size="md">
          <AnsibleTowerIcon />
        </Icon>
      </Button>
    </Popover>
    {pathEditMode && (
      <>
        <Popover
          triggerAction="hover"
          aria-label="delete popover"
          headerContent={<div>Delete</div>}
          bodyContent={<div>Delete this Lifecycle Environment.</div>}
        >
          <Button
            variant="plain"
            aria-label="Action"
            onClick={() => handleDestroy()}
          >
            <Icon size="md">
              <TrashIcon />
            </Icon>
          </Button>
        </Popover>
        <Popover
          triggerAction="hover"
          aria-label="edit popover"
          headerContent={<div>Edit</div>}
          bodyContent={<div>Edit this Lifecycle Environment.</div>}
        >
          <Button
            variant="plain"
            aria-label="Action"
            onClick={handleEdit}
            isInline
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
          </Button>
        </Popover>
      </>
    )}
  </>
);
