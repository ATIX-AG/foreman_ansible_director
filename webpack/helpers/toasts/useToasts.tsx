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
import { promoteError, promoteSuccess, promoteSuccessWarn } from './promoteToasts';
import { resourceIdentifier } from '../../resources/utils';
import { AlertContext } from '../../components/common/Alerts/AlertContext';

interface CrudToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> {
  type: crudOperation;
  resource: resourceIdentifier;
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>>;
}

interface PromoteToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> {
  type: 'promote';
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>>;
}

type WithToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> = CrudToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError>
  | PromoteToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError>;

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
      const { type, func } = options;
      const response = await func;

      let params: toastParams | null = null;

      switch (type) {
        case 'create':
        case 'update':
        case 'delete': {
          const crudOptions = options satisfies CrudToastOptions<
            TCreated,
            TUpdated,
            TDeleted,
            TWarning,
            TError
          >;
          if (response.ok) {
            if (response.warnings.length > 0) {
              params = crudSuccessWarn(
                type,
                crudOptions.resource,
                response.warnings,
                () => context?.showAlert(response.warnings)
              );
            } else {
              params = crudSuccess(type, crudOptions.resource);
            }
          } else {
            params = crudError(
              type,
              crudOptions.resource,
              response.errors,
              () => context?.showAlert(response.errors)
            );
          }
          break;
        }
        case 'promote':
          if (response.ok) {
            if (response.warnings.length > 0) {
              params = promoteSuccessWarn(response.warnings, () =>
                context?.showAlert(response.warnings));
            }
            else {
              params = promoteSuccess();
            }
          }
          else {
            params = promoteError(response.errors, () =>
              context?.showAlert(response.errors));
          }
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
