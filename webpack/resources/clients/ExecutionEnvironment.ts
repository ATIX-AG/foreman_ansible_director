import { AnsibleExecutionEnv } from '../../types/AnsibleExecutionEnvTypes';
import { ApiResponse, backendRequest } from '../backendClient';
import { Organizable } from '../types';

export interface ExecutionEnvironmentCreatePayload extends Organizable {
  execution_environment: Pick<
    AnsibleExecutionEnv,
    'name' | 'base_image_url' | 'ansible_version'
  >;
}

export interface ExecutionEnvironmentUpdatePayload {
  execution_environment: Partial<
    ExecutionEnvironmentCreatePayload['execution_environment']
  >;
}

export class ExecutionEnvironment {
  static create (
    createParams: ExecutionEnvironmentCreatePayload
  ): Promise<ApiResponse<AnsibleExecutionEnv, never, never, never, never>> {
    return backendRequest<
      AnsibleExecutionEnv,
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
  static update (
    id: number,
    updateParams: ExecutionEnvironmentUpdatePayload
  ): Promise<ApiResponse<never, AnsibleExecutionEnv, never, never, never>> {
    return backendRequest<
      never,
      AnsibleExecutionEnv,
      never,
      never,
      never,
      ExecutionEnvironmentUpdatePayload,
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
  ): Promise<ApiResponse<never, never, AnsibleExecutionEnv, never, never>> {
    return backendRequest<
      never,
      never,
      AnsibleExecutionEnv,
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
