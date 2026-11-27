import React, { ReactElement } from 'react';
import { Icon } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import PendingIcon from '@patternfly/react-icons/dist/esm/icons/pending-icon';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { ExecutionEnvironment } from '../../../types/AnsibleExecutionEnvTypes';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';

const statusIcon = (status: ExecutionEnvironment['status']): ReactElement => {
  switch (status) {
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

const statusMessage = (status: ExecutionEnvironment['status']): string => {
  switch (status) {
    case 'success':
      return _('Foreman successfully built this Execution Environment.');
    case 'failed':
      return _(
        'Foreman encountered an error while building this Execution Environment. Check the logs in the corresponding task.'
      );
    case 'running':
      return _('Foreman is building this Execution Environment.');
  }
};

interface ExecutionEnvStatusButtonProps {
  executionEnv: ExecutionEnvironment;
}

export const ExecutionEnvStatusButton = ({
  executionEnv,
}: ExecutionEnvStatusButtonProps): ReactElement => (
  <PermittedButton
    // TODO: Probably should require foreman-tasks permission too
    requiredPermissions={[AdPermissions.executionEnvironments.view]}
    hasPopover
    popoverProps={{
      triggerAction: 'hover',
      'aria-label': _('build status popover'),
      headerComponent: 'h1',
      headerContent: __(_('Build %(status)s'), { status: executionEnv.status }),
      bodyContent: <div>{statusMessage(executionEnv.status)}</div>,
    }}
    variant="plain"
    aria-label="Action"
    onClick={() => {
      const baseUrl = window.location.origin;
      window.open(
        `${baseUrl}/foreman_tasks/tasks/${executionEnv.latest_task_id}`,
        '_blank'
      );
    }}
  >
    {statusIcon(executionEnv.status)}
  </PermittedButton>
);
