import { ApiResponse, backendRequest } from '../backendClient';
import { AnsibleVariableBinding as AnsibleVariableBindingType } from '../../types/AnsibleVariableTypes';
import { CollectionRoleAssignable } from '../../types/DynamicAssignmentTypes';

export interface AnsibleVariableBindingCreatePayload {
  ansible_variable_binding: Pick<AnsibleVariableBindingType,
    'raw_value' | 'data_type'> & CollectionRoleAssignable & {
      variable_name: string;
      // TODO: allow usage of canonical names e.g.: "Hostgroup" | "Host"
      target: 'host' | 'hostgroup';
      target_id: number;
    };
}

export interface AnsibleVariableBindingUpdateFullPayload extends AnsibleVariableBindingCreatePayload {}

export type AnsibleVariableBindingUpdatePartialPayload = {
  ansible_variable_binding: Partial<Omit<AnsibleVariableBindingType,
    'id' | 'consumable_name'>>;
};

export class AnsibleVariableBinding {
  static create (
    createParams: AnsibleVariableBindingCreatePayload
  ): Promise<ApiResponse<AnsibleVariableBindingType, never, never, never, never>> {
    return backendRequest<
      AnsibleVariableBindingType,
      never,
      never,
      never,
      never,
      AnsibleVariableBindingCreatePayload,
      never
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/ansible_variables/bindings',
      payload: createParams,
    });
  }

  static update (
    id: number,
    updateParams: AnsibleVariableBindingUpdateFullPayload
  ): Promise<ApiResponse<never, AnsibleVariableBindingType, never, never, never>> {
    return backendRequest<
      never,
      AnsibleVariableBindingType,
      never,
      never,
      never,
      AnsibleVariableBindingUpdateFullPayload,
      { id: number }
    >({
      method: 'PUT',
      path: '/api/v2/ansible_director/ansible_variables/bindings/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static updatePartial (
    id: number,
    updateParams: AnsibleVariableBindingUpdatePartialPayload
  ): Promise<ApiResponse<never, AnsibleVariableBindingType, never, never, never>> {
    return backendRequest<
      never,
      AnsibleVariableBindingType,
      never,
      never,
      never,
      AnsibleVariableBindingUpdatePartialPayload,
      { id: number }
    >({
      method: 'PATCH',
      path: '/api/v2/ansible_director/ansible_variables/bindings/:id',
      payload: updateParams,
      queryParams: {
        id,
      },
    });
  }

  static destroy (
    id: number
  ): Promise<ApiResponse<never, never, AnsibleVariableBindingType, never, never>> {
    return backendRequest<
      never,
      never,
      AnsibleVariableBindingType,
      never,
      never,
      never,
      { id: number }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/ansible_variables/bindings/:id',
      queryParams: {
        id,
      },
    });
  }
}
