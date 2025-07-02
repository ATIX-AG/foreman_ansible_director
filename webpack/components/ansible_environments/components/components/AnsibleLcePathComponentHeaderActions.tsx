import React from 'react';
import { Button, Icon, Popover } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { AnsibleLcePath } from '../../../../types/AnsibleEnvironmentsTypes';

interface AnsibleLcePathComponentHeaderActionsProps {
  lcePath: AnsibleLcePath;
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: () => void;
}

export const AnsibleLcePathComponentHeaderActions: React.FC<AnsibleLcePathComponentHeaderActionsProps> = ({
  lcePath,
  editMode,
  handleEdit,
  handleDestroy,
}) => (
  <>
    {lcePath.description !== '' && (
      <Popover
        triggerAction="hover"
        aria-label="delete popover"
        headerContent={<div>Description</div>}
        bodyContent={<div>{lcePath.description}</div>}
      >
        <Button
          variant="plain"
          aria-label="Action"
          onClick={() => handleDestroy()}
        >
          <Icon size="lg">
            <InfoCircleIcon />
          </Icon>
        </Button>
      </Popover>
    )}
    <Popover
      triggerAction="hover"
      aria-label="delete popover"
      headerContent={<div>Delete</div>}
      bodyContent={<div>Delete this Lifecycle Environment Path.</div>}
    >
      <Button
        variant="plain"
        aria-label="Action"
        onClick={() => handleDestroy()}
      >
        <Icon size="lg">
          <TrashIcon />
        </Icon>
      </Button>
    </Popover>
    <Popover
      triggerAction="hover"
      aria-label="edit popover"
      headerContent={<div>Edit</div>}
      bodyContent={<div>Edit this Lifecycle Environment Path.</div>}
    >
      <Button variant="plain" aria-label="Action" onClick={handleEdit}>
        {editMode ? (
          <Icon size="lg">
            <SaveIcon />
          </Icon>
        ) : (
          <Icon size="lg">
            <EditIcon />
          </Icon>
        )}
      </Button>
    </Popover>
  </>
);
