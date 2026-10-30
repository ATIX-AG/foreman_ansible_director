import {
  ExecutionEnvironment as ExecutionEnvironmentType,
  ExecutionEnvironmentDraft,
} from '../../types/AnsibleExecutionEnvTypes';
import { ApiResponse, backendRequest } from '../backendClient';
import { Organizable } from '../types';
import { Task } from '../../types/common';

export interface ExecutionEnvironmentCreatePayload extends Organizable {
  execution_environment: ExecutionEnvironmentDraft;
}

export interface ExecutionEnvironmentImportPayload extends Organizable {
  execution_environment: Pick<
    ExecutionEnvironmentDraft,
    'name' | 'container_image_url'
  >;
}

export interface ExecutionEnvironmentUpdateFullPayload {
  execution_environment: Partial<ExecutionEnvironmentDraft>;
}

export interface ExecutionEnvironmentUpdatePartialPayload {
  execution_environment: Partial<ExecutionEnvironmentUpdateFullPayload>;
}

export class ExecutionEnvironment {
  static create (
    createParams: ExecutionEnvironmentCreatePayload
  ): Promise<
    ApiResponse<ExecutionEnvironmentType, never, never, never, never>
  > {
    return backendRequest<
      ExecutionEnvironmentType,
      never,
      never,
      never,
      never,
      ExecutionEnvironmentCreatePayload,
      never
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/execution_environments',
      payload: createParams,
    });
  }

  static import (
    importParams: ExecutionEnvironmentImportPayload
  ): Promise<
    ApiResponse<
      ExecutionEnvironmentType,
      never,
      never,
      never,
      never
    >
  > {
    return backendRequest<
      ExecutionEnvironmentType,
      never,
      never,
      never,
      never,
      ExecutionEnvironmentImportPayload,
      never,
      never
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/execution_environments/import',
      payload: importParams,
    });
  }

  static update (
    id: number,
    updateParams: ExecutionEnvironmentUpdateFullPayload
  ): Promise<
    ApiResponse<never, ExecutionEnvironmentType, never, never, never>
  > {
    return backendRequest<
      never,
      ExecutionEnvironmentType,
      never,
      never,
      never,
      ExecutionEnvironmentUpdateFullPayload,
      { id: number }
    >({
      method: 'PUT',
      path: '/api/v2/ansible_director/execution_environments/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static update_partial (
    id: number,
    updateParams: ExecutionEnvironmentUpdatePartialPayload
  ): Promise<
    ApiResponse<never, ExecutionEnvironmentType, never, never, never>
  > {
    return backendRequest<
      never,
      ExecutionEnvironmentType,
      never,
      never,
      never,
      ExecutionEnvironmentUpdatePartialPayload,
      { id: number }
    >({
      method: 'PATCH',
      path: '/api/v2/ansible_director/execution_environments/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static destroy (
    id: number
  ): Promise<
    ApiResponse<never, never, ExecutionEnvironmentType, never, never>
  > {
    return backendRequest<
      never,
      never,
      ExecutionEnvironmentType,
      never,
      never,
      never,
      { id: number }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/execution_environments/:id',
      queryParams: {
        id,
      },
    });
  }
}
