import {
  AnsibleLce,
} from '../../types/AnsibleEnvironmentsTypes';
import { ApiResponse, backendRequest } from '../backendClient';
import { Organizable } from '../types';

export interface LifecycleEnvironmentCreatePayload extends Organizable {
  lifecycle_environment_path_id: number;
  lifecycle_environment: Pick<AnsibleLce, 'name' | 'position'> & {
    content_unit_version_ids: number[];
  };
}

export interface LifecycleEnvironmentUpdateFullPayload {
  lifecycle_environment: {
    name: string;
    execution_environment_id: number;
    content_unit_version_ids: number[];
  };
}

export interface LifecycleEnvironmentUpdatePartialPayload {
  lifecycle_environment: Partial<LifecycleEnvironmentUpdateFullPayload['lifecycle_environment']>;
}

export class LifecycleEnvironment {
  static create (
    createParams: LifecycleEnvironmentCreatePayload
  ): Promise<ApiResponse<AnsibleLce, never, never, never, never>> {
    return backendRequest<
      AnsibleLce,
      never,
      never,
      never,
      never,
      LifecycleEnvironmentCreatePayload,
      never
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/lifecycle_environments',
      payload: createParams,
    });
  }
  static update (
    id: number,
    updateParams: LifecycleEnvironmentUpdateFullPayload
  ): Promise<ApiResponse<never, AnsibleLce, never, never, never>> {
    return backendRequest<
      never,
      AnsibleLce,
      never,
      never,
      never,
      LifecycleEnvironmentUpdateFullPayload,
      { id: number }
    >({
      method: 'PUT',
      path: '/api/v2/ansible_director/lifecycle_environments/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static updatePartial (
    id: number,
    updateParams: LifecycleEnvironmentUpdatePartialPayload
  ): Promise<ApiResponse<never, AnsibleLce, never, never, never>> {
    return backendRequest<
      never,
      AnsibleLce,
      never,
      never,
      never,
      LifecycleEnvironmentUpdatePartialPayload,
      { id: number }
    >({
      method: 'PATCH',
      path: '/api/v2/ansible_director/lifecycle_environments/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static destroy (
    id: number
  ): Promise<ApiResponse<never, never, AnsibleLce, never, never>> {
    return backendRequest<
      never,
      never,
      AnsibleLce,
      never,
      never,
      never,
      { id: number }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/lifecycle_environments/:id',
      queryParams: {
        id,
      },
    });
  }
}
