import { Icon } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import PendingIcon from '@patternfly/react-icons/dist/esm/icons/pending-icon';

import React, { ReactElement } from 'react';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { isAnsibleExecutionEnv } from '../../../helpers/typeGuards/executionEnvTypeGuards';

interface ExecutionEnvCardHeaderActionsProps {
  editMode: boolean;
  handleEdit: () => void;
  handleDestroy: (
    executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate
  ) => void;
  executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate;
}

export const ExecutionEnvCardHeaderActions = ({
  editMode,
  handleEdit,
  handleDestroy,
  executionEnvironment,
}: ExecutionEnvCardHeaderActionsProps): ReactElement => {
  const statusIcon = (env: AnsibleExecutionEnv): ReactElement => {
    switch (env.build_status) {
      case 'success':
        return (
          <Icon status="success" size="lg">
            <CheckCircleIcon />
          </Icon>
        );
      case 'failed':
        return (
          <Icon status="danger" size="lg">
            <ExclamationCircleIcon />
          </Icon>
        );
      case 'running':
        return (
          <Icon status="info" size="lg">
            <InProgressIcon />
          </Icon>
        );
      default:
        return (
          <Icon size="lg">
            <PendingIcon />
          </Icon>
        );
    }
  };

  const statusMessage = (env: AnsibleExecutionEnv): string => {
    switch (env.build_status) {
      case 'success':
        return _('Foreman successfully built this Execution Environment.');
      case 'failed':
        return _(
          'Foreman encountered an error while building this Execution Environment. Check the logs in the corresponding task.'
        );
      case 'running':
        return _('Foreman is building this Execution Environment.');
      default:
        return _('Foreman has scheduled building this Execution Environment.');
    }
  };

  return (
    <>
      {isAnsibleExecutionEnv(executionEnvironment) && (
        <PermittedButton
          // TODO: Probably should require foreman-tasks permission too
          requiredPermissions={[AdPermissions.executionEnvironments.view]}
          hasPopover
          popoverProps={{
            triggerAction: 'hover',
            'aria-label': 'build status popover',
            headerComponent: 'h1',
            headerContent: __(_('Build %(status)s'), {
              status: executionEnvironment.build_status,
            }),
            bodyContent: <div>{statusMessage(executionEnvironment)}</div>,
          }}
          variant="plain"
          aria-label="Action"
          onClick={() => {
            const baseUrl = window.location.origin;
            window.open(
              `${baseUrl}/foreman_tasks/tasks/${executionEnvironment.build_job}`,
              '_blank'
            );
          }}
        >
          {statusIcon(executionEnvironment)}
        </PermittedButton>
      )}
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
};
