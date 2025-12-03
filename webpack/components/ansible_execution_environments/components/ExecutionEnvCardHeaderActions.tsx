import { Button, Popover, Icon } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import React from 'react';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';

interface ExecutionEnvCardHeaderActionsProps {
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: (
    executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate
  ) => void;
  executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate;
  canEdit: boolean;
  canDestroy: boolean;
}

export const ExecutionEnvCardHeaderActions: React.FC<ExecutionEnvCardHeaderActionsProps> = ({
  editMode,
  handleEdit,
  handleDestroy,
  executionEnvironment,
  canEdit,
  canDestroy,
}) => (
  <>
    {canDestroy && (
      <Popover
        triggerAction="hover"
        aria-label="delete popover"
        headerContent={<div>Delete</div>}
        bodyContent={<div>Delete this Execution Environment definition.</div>}
      >
        <Button
          variant="plain"
          aria-label="Action"
          onClick={() => handleDestroy(executionEnvironment)}
        >
          <Icon size="lg">
            <TrashIcon />
          </Icon>
        </Button>
      </Popover>
    )}
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
    )}
  </>
);
