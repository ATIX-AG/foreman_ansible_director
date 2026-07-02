import { addToast, toastParams } from 'foremanReact/components/ToastsList';
import { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { ApiResponse } from '../../resources/backendClient';
import { AnsibleDirectorError } from '../../types/issues/errors';
import { AnsibleDirectorWarning } from '../../types/issues/warnings';
import {
  crudError,
  crudOperation,
  crudSuccess,
  crudSuccessWarn,
} from './crudToasts';
import { resourceIdentifier } from '../../resources/utils';
import { AlertContext } from '../../components/common/Alerts/AlertContext';

type ToastType = crudOperation;

interface WithToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> {
  type: ToastType;
  resource: resourceIdentifier;
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>>;
}

interface UseToastsReturn {
  withToast: <
    TCreated,
    TUpdated,
    TDeleted,
    TWarning extends AnsibleDirectorWarning,
    TError extends AnsibleDirectorError
  >(
    options: WithToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError>
  ) => Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>>;
  dispatchToast: (params: toastParams) => void;
}

export const useToasts = (): UseToastsReturn => {
  const dispatch = useDispatch();
  const context = useContext(AlertContext);

  const withToast = useCallback(
    async <
      TCreated,
      TUpdated,
      TDeleted,
      TWarning extends AnsibleDirectorWarning,
      TError extends AnsibleDirectorError
    >(
      options: WithToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError>
    ): Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>> => {
      const { type, resource, func } = options;
      const response = await func;

      let params: toastParams | null = null;

      switch (type) {
        case 'create':
        case 'update':
        case 'delete':
          if (response.ok) {
            if (response.warnings.length > 0) {
              params = crudSuccessWarn(type, resource, response.warnings, () =>
                context?.showAlert(response.warnings));
            } else {
              params = crudSuccess(type, resource);
            }
          } else {
            params = crudError(type, resource, response.errors, () =>
              context?.showAlert(response.errors));
          }
          break;
      }

      if (params) {
        dispatch(addToast(params));
      }

      return response;
    },
    [context, dispatch]
  );

  return {
    withToast,
    dispatchToast: (params: toastParams) => dispatch(addToast(params)),
  };
};
