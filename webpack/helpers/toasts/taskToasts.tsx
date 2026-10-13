import React from 'react';
import { Button } from '@patternfly/react-core';
import { toastParams } from 'foremanReact/components/ToastsList';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { foremanUrl } from 'foremanReact/common/helpers';
import { AnsibleDirectorWarning } from '../../types/issues/warnings';
import { AnsibleDirectorError } from '../../types/issues/errors';
import { Task } from '../../types/common';

export const taskStartSuccess = (
  task: Task
): toastParams => ({
  type: 'success',
  key: `TASK_START_${task.id}_SUCC`,
  message: (
    <span>
      {_(
        'A background task started successfully!'
      )}
      <br />
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={foremanUrl(
          `/foreman_tasks/tasks/${task.id}`
        )}
      >
        {_('View the task page for more details.')}
      </a>
    </span>
  ),
  sticky: false,
});

export const taskStartWarning = (
  task: Task,
  warnings: AnsibleDirectorWarning[],
  showAlertModal: () => void
): toastParams => ({
  type: 'warning',
  key: `TASK_START_${task.id}_SUCC_WARN`,
  message: (
    <span>
      {__(
        _('A background task started successfully, but %(plural)s issued.'),
        {
          plural:
                  warnings.length > 1 ? 'multiple warnings were' : 'a warning was',
        }
      )}
      <br />
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={foremanUrl(
          `/foreman_tasks/tasks/${task.id}`
        )}
      >
        {_('View the task page for more details.')}
      </a>
      <br />
      <Button variant={'control'} onClick={() => showAlertModal()}>{_('View details')}</Button>
    </span>
  ),
  sticky: false,
});

export const taskStartError = (
  errors: AnsibleDirectorError[],
  showAlertModal: () => void
): toastParams => ({
  type: 'danger',
  key: 'TASK_START_ERR',
  message: (
    <span>
      {__(_('%(plural)s occurred while starting background task!'), {
        plural: errors.length > 1 ? 'Multiple errors' : 'An error',
      })}
      <br />
      <Button variant={'control'} onClick={() => showAlertModal()}>{_('View details')}</Button>
    </span>
  ),
  sticky: false,
});
