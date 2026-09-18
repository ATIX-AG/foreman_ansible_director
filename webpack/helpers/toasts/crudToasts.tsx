import React from 'react';
import { Button } from '@patternfly/react-core';
import { toastParams } from 'foremanReact/components/ToastsList';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import {
  resourceIdDisplayNameMap,
  resourceIdentifier,
} from '../../resources/utils';
import { AnsibleDirectorWarning } from '../../types/issues/warnings';
import { AnsibleDirectorError } from '../../types/issues/errors';

export type crudOperation = 'create' | 'update' | 'delete';

export const crudSuccess = (
  operation: crudOperation,
  resource: resourceIdentifier
): toastParams => ({
  type: 'success',
  key: `${operation.toUpperCase()}_${resource.toUpperCase()}_SUCC`,
  message: __(_('Successfully %(operation)sd %(resource)s!'), {
    operation,
    resource: resourceIdDisplayNameMap[resource],
  }),
  sticky: false,
});

export const crudSuccessWarn = (
  operation: crudOperation,
  resource: resourceIdentifier,
  warnings: AnsibleDirectorWarning[],
  showAlertModal: () => void
): toastParams => ({
  type: 'warning',
  key: `${operation.toUpperCase()}_${resource.toUpperCase()}_SUCC`,
  message: (
    <span>
      {__(
        _('Successfully %(operation)sd %(resource)s, but %(plural)s issued.'),
        {
          operation,
          resource: resourceIdDisplayNameMap[resource],
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

export const crudError = (
  operation: crudOperation,
  resource: resourceIdentifier,
  errors: AnsibleDirectorError[],
  showAlertModal: () => void
): toastParams => ({
  type: 'danger',
  key: `${operation.toUpperCase()}_${resource.toUpperCase()}_ERR`,
  message: (
    <span>
      {__(_('%(plural)s occurred while %(operation)sing %(resource)s!'), {
        plural: errors.length > 1 ? 'Multiple errors' : 'An error',
        operation: operation.substring(0, operation.length - 1),
        resource: resourceIdDisplayNameMap[resource],
      })}
      <br />
      <Button variant={'control'} onClick={() => showAlertModal()}>{_('View details')}</Button>
    </span>
  ),
  sticky: false,
});
