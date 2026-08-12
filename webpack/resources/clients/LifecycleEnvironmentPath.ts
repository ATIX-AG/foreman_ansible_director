import { AnsibleLcePath } from '../../types/AnsibleEnvironmentsTypes';
import { ApiResponse, backendRequest } from '../backendClient';
import { Organizable } from '../types';

export interface LifecycleEnvironmentPathCreatePayload extends Organizable {
  lifecycle_environment_path: Pick<
    AnsibleLcePath,
    'name' | 'description'
  >;
}

export interface LifecycleEnvironmentPathUpdatePayload {
  lifecycle_environment_path: Pick<
    AnsibleLcePath,
    'name' | 'description'
  >;
}

export interface LifecycleEnvironmentPathPromotePayload {
  promote: {
    source_environment_id: number;
    target_environment_id: number;
  };
}

// TODO: Implement PATCH endpoint
// export interface LifecycleEnvironmentPathPartialUpdatePayload {
//  lifecycle_environment_path: Partial<
//    LifecycleEnvironmentPathUpdatePayload['lifecycle_environment_path']
//  >;
// }

export class LifecycleEnvironmentPath {
  static create (
    createParams: LifecycleEnvironmentPathCreatePayload
  ): Promise<ApiResponse<AnsibleLcePath, never, never, never, never>> {
    return backendRequest<
      AnsibleLcePath,
      never,
      never,
      never,
      never,
      LifecycleEnvironmentPathCreatePayload,
      never
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/lifecycle_environments/paths',
      payload: createParams,
    });
  }
  static update (
    id: number,
    updateParams: LifecycleEnvironmentPathUpdatePayload
  ): Promise<ApiResponse<never, AnsibleLcePath, never, never, never>> {
    return backendRequest<
      never,
      AnsibleLcePath,
      never,
      never,
      never,
      LifecycleEnvironmentPathUpdatePayload,
      { id: number }
    >({
      method: 'PUT',
      path: '/api/v2/ansible_director/lifecycle_environments/paths/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static promote (
    id: number,
    promoteParams: LifecycleEnvironmentPathPromotePayload
  ): Promise<ApiResponse<never, AnsibleLcePath, never, never, never>> {
    return backendRequest<
      never,
      AnsibleLcePath,
      never,
      never,
      never,
      LifecycleEnvironmentPathPromotePayload,
      { id: number }
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/lifecycle_environments/paths/:id/promote',
      payload: promoteParams,
      queryParams: {
        id,
      },
    });
  }

  static destroy (
    id: number
  ): Promise<ApiResponse<never, never, AnsibleLcePath, never, never>> {
    return backendRequest<
      never,
      never,
      AnsibleLcePath,
      never,
      never,
      never,
      { id: number }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/lifecycle_environments/paths/:id',
      queryParams: {
        id,
      },
    });
  }
}
