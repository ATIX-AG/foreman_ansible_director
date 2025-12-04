import { Button, Popover, Icon } from '@patternfly/react-core';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import React from 'react';

interface HostDetailsLceCardHeaderActionsProps {
  isEditMode: boolean;
  handleEdit: () => void;
  canEdit: boolean;
}

export const HostDetailsLceCardHeaderActions: React.FC<HostDetailsLceCardHeaderActionsProps> = ({
  isEditMode,
  handleEdit,
  canEdit,
}) => (
  <>
    {canEdit && (
      <Popover
        triggerAction="hover"
        aria-label="edit popover"
        headerContent={<div>Edit</div>}
        bodyContent={
          <div>
            Edit this Execution Environment definition. This will require the
            image to be rebuilt.
          </div>
        }
      >
        <Button variant="plain" aria-label="Action" onClick={handleEdit}>
          {isEditMode ? (
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
    )}
  </>
);
