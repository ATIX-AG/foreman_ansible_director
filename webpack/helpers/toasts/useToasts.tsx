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
import { taskStartError, taskStartSuccess, taskStartWarning } from './taskToasts';
import { Task } from '../../types/common';

interface CrudToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError,
  TResponse
> {
  type: crudOperation;
  resource: resourceIdentifier;
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>>;
}

interface PromoteToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError,
  TResponse
> {
  type: 'promote';
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>>;
}

interface TaskToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> {
  type: 'task';
  func: Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, { task: Task }>>;
}

type WithToastOptions<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError,
  TResponse
> = CrudToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>
  | PromoteToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>
  | TaskToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError>;

interface UseToastsReturn {
  withToast: <
    TCreated,
    TUpdated,
    TDeleted,
    TWarning extends AnsibleDirectorWarning,
    TError extends AnsibleDirectorError,
    TResponse
  >(
    options: WithToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>
  ) => Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>>;
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
      TError extends AnsibleDirectorError,
      TResponse
    >(
      options: WithToastOptions<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>
    ): Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>> => {
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
            TError,
            TResponse
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
          break;
        case 'task':
          if (response.ok) {
            if (response.warnings.length > 0) {
              params = taskStartWarning((response.results as { task: Task }).task, response.warnings, () =>
                context?.showAlert(response.warnings));
            }
            else {
              params = taskStartSuccess((response.results as { task: Task }).task);
            }
          }
          else {
            params = taskStartError(response.errors, () =>
              context?.showAlert(response.errors));
          }
          break;
      }

      if (params) {
        dispatch(addToast(params));
      }

      return response as unknown as ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError, TResponse>;
    },
    [context, dispatch]
  );

  return {
    withToast,
    dispatchToast: (params: toastParams) => dispatch(addToast(params)),
  };
};
