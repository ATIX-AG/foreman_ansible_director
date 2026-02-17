import { Icon } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import React from 'react';

import { translate as _ } from 'foremanReact/common/I18n';

import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';

interface ExecutionEnvCardHeaderActionsProps {
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: (
    executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate
  ) => void;
  executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate;
}

export const ExecutionEnvCardHeaderActions: React.FC<ExecutionEnvCardHeaderActionsProps> = ({
  editMode,
  handleEdit,
  handleDestroy,
  executionEnvironment,
}) => (
  <>
    <PermittedButton
      requiredPermissions={[AdPermissions.executionEnvironments.destroy]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'destroy popover',
        headerComponent: 'h1',
        headerContent: _('Delete'),
        bodyContent: <div>{_('Delete this Execution Environment.')}</div>,
      }}
      variant="plain"
      aria-label="Action"
      onClick={() => handleDestroy(executionEnvironment)}
    >
      <Icon size="lg">
        <TrashIcon />
      </Icon>
    </PermittedButton>
    <PermittedButton
      requiredPermissions={[AdPermissions.executionEnvironments.edit]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'edit popover',
        headerComponent: 'h1',
        headerContent: _('Edit'),
        bodyContent: (
          <div>
            {_(
              'Edit this Execution Environment. If you make a change, Foreman will rebuild the Execution Environment.'
            )}
          </div>
        ),
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
