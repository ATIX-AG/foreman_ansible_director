import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface Identifiable {
  id: number;
}

export interface AnsibleExecutionEnvBase {
  name: string;
  // eslint-disable-next-line camelcase
  base_image_url: string;
  // eslint-disable-next-line camelcase
  ansible_version: string;
  // eslint-disable-next-line camelcase
  image_hash?: string;
  // eslint-disable-next-line camelcase
  image_url?: string;
  // eslint-disable-next-line camelcase
  content: AnsibleContentUnitAssignment[];
}

export interface ExecutionEnvContentUnit extends Identifiable {
  type: string;
  identifier: string;
  version: string;
}

export interface AnsibleExecutionEnv
  extends Identifiable,
    AnsibleExecutionEnvBase {
  // eslint-disable-next-line camelcase
  build_status: 'pending' | 'running' | 'success' | 'failed';
  // eslint-disable-next-line camelcase
  build_job: string;
}

export interface AnsibleExecutionEnvCreate extends AnsibleExecutionEnvBase {}
