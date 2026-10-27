import { ApiResponse, backendRequest } from '../backendClient';
import { AnsibleDirectorError } from '../../types/issues/errors';
import { AnsibleDirectorWarning } from '../../types/issues/warnings';
import { Task } from '../../types/common';

export interface AnsibleContentUnitImport {
  unit_name: string;
  unit_type: 'collection' | 'role';
  unit_source_type: 'galaxy' | 'git';
  unit_source: string;
  unit_versions: string[];
}

export interface AnsibleContentCreatePayload {
  organization_id: number;
  units: AnsibleContentUnitImport[];
}

export interface AnsibleContentUnitDestroy {
  unit_id: number;
  unit_version_ids?: number[];
}

export interface AnsibleContentDestroyPayload {
  units: AnsibleContentUnitDestroy[];
}

export class AnsibleContent {
  static create (
    createParams: AnsibleContentCreatePayload
  ): Promise<ApiResponse<never, never, never, AnsibleDirectorWarning, AnsibleDirectorError, { task: Task }>> {
    return backendRequest<
      never,
      never,
      never,
      AnsibleDirectorWarning,
      AnsibleDirectorError,
      AnsibleContentCreatePayload,
      never,
      { task: Task }
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/ansible_content',
      payload: createParams,
    });
  }

  static destroy (
    destroyParams: AnsibleContentDestroyPayload
  ): Promise<ApiResponse<never, never, never, AnsibleDirectorWarning, AnsibleDirectorError, { task: Task }>> {
    return backendRequest<
      never,
      never,
      never,
      AnsibleDirectorWarning,
      AnsibleDirectorError,
      AnsibleContentDestroyPayload,
      never,
      { task: Task }
    >({
      method: 'DELETE',
      path: '/api/v2/ansible_director/ansible_content',
      payload: destroyParams,
    });
  }

  static consistencyCheck (): Promise<ApiResponse<never, never, never, AnsibleDirectorWarning, AnsibleDirectorError, { task: Task }>> {
    return backendRequest<
      never,
      never,
      never,
      AnsibleDirectorWarning,
      AnsibleDirectorError,
      never,
      never,
      { task: Task }
    >({
      method: 'POST',
      path: '/api/v2/ansible_director/ansible_content/consistency_check',
    });
  }
}
