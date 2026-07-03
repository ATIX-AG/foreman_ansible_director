import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface Identifiable {
  id: number;
}

export interface AnsibleExecutionEnvBase {
  name: string;
  base_image_url: string;
  ansible_version: string;
  image_hash?: string;
  image_url?: string;
  content: AnsibleContentUnitAssignment[];
}

export interface ExecutionEnvContentUnit extends Identifiable {
  type: string;
  identifier: string;
  version: string;
}

export interface AnsibleExecutionEnv extends Identifiable, AnsibleExecutionEnvBase {
  build_status: 'pending' | 'running' | 'success' | 'failed';
  build_job: string;
}

export interface AnsibleExecutionEnvCreate extends AnsibleExecutionEnvBase {}
