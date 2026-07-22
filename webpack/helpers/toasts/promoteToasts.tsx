import React from 'react';
import { Button } from '@patternfly/react-core';
import { toastParams } from 'foremanReact/components/ToastsList';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { AnsibleDirectorWarning } from '../../types/issues/warnings';
import { AnsibleDirectorError } from '../../types/issues/errors';

export const promoteSuccess = (): toastParams => ({
  type: 'success',
  key: 'PROMOTE_LCE_PATH_SUCC',
  message: _('Successfully promoted Lifecycle Environment Path!'),
  sticky: false,
});

export const promoteSuccessWarn = (
  warnings: AnsibleDirectorWarning[],
  showAlertModal: () => void
): toastParams => ({
  type: 'warning',
  key: 'PROMOTE_LCE_PATH_SUCC_WARN',
  message: (
    <span>
      {__(
        _('Successfully promoted Lifecycle Environment Path, but %(plural)s issued.'),
        {
          plural:
            warnings.length > 1 ? 'multiple warnings were' : 'a warning was',
        }
      )}
      <br />
      <Button variant={'control'} onClick={() => showAlertModal()}>{_('View details')}</Button>
    </span>
  ),
  sticky: false,
});

export const promoteError = (
  errors: AnsibleDirectorError[],
  showAlertModal: () => void
): toastParams => ({
  type: 'danger',
  key: 'PROMOTE_LCE_PATH_ERR',
  message: (
    <span>
      {__(_('%(plural)s occurred while promoting Lifecycle Environment Path!'), {
        plural: errors.length > 1 ? 'Multiple errors' : 'An error',
      })}
      <br />
      <Button variant={'control'} onClick={() => showAlertModal()}>{_('View details')}</Button>
    </span>
  ),
  sticky: false,
});
