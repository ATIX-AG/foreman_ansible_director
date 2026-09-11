import { ApiResponse, backendRequest } from '../backendClient';
import { AnsibleVariable as AnsibleVariableType } from '../../types/AnsibleVariableTypes';

export interface AnsibleVariableUpdateFullPayload {
  ansible_variable: Pick<AnsibleVariableType,
  'name' | 'data_type' | 'raw_value'>;
}

export interface AnsibleVariableUpdatePartialPayload {
  ansible_variable: Partial<Pick<AnsibleVariableType,
    'name' | 'data_type' | 'raw_value'>>;
}

export class AnsibleVariable {
  static update (
    id: number,
    updateParams: AnsibleVariableUpdateFullPayload
  ): Promise<ApiResponse<never, AnsibleVariableType, never, never, never>> {
    return backendRequest<
      never,
      AnsibleVariableType,
      never,
      never,
      never,
      AnsibleVariableUpdateFullPayload,
      { id: number }
    >({
      method: 'PUT',
      path: '/api/v2/ansible_director/ansible_variables/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static updatePartial (
    id: number,
    updateParams: AnsibleVariableUpdatePartialPayload
  ): Promise<ApiResponse<never, AnsibleVariableType, never, never, never>> {
    return backendRequest<
      never,
      AnsibleVariableType,
      never,
      never,
      never,
      AnsibleVariableUpdatePartialPayload,
      { id: number }
    >({
      method: 'PATCH',
      path: '/api/v2/ansible_director/ansible_variables/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static destroy (
    id: number
  ): Promise<ApiResponse<never, never, AnsibleVariableType, never, never>> {
    return backendRequest<
      never,
      never,
      AnsibleVariableType,
      never,
      never,
      never,
      { id: number }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/ansible_variables/:id',
      queryParams: {
        id,
      },
    });
  }
}
