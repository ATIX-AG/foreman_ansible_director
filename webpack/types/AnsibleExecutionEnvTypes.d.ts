import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface Identifiable {
  id: number;
}

export interface AnsibleExecutionEnvBase {
  name: string;
  container_image_url: string;
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
  status: 'pending' | 'running' | 'success' | 'failed';
  latest_task_id: string;
}

export interface AnsibleExecutionEnvCreate extends AnsibleExecutionEnvBase {}

interface ExecutionEnvironment extends Identifiable {
  name: string;
  source: 'image_build' | 'image_import';
  container_image_url: string;
  ansible_version: string | null;
  latest_task_id: number;
  content: AnsibleContentUnitAssignment[] | null;
}

interface ExecutionEnvironmentBuilt extends Base {
  source: 'image_build';
  ansible_version: string;
  content: AnsibleContentUnitAssignment[];
}

interface ExecutionEnvironmentImported extends Base {
  source: 'image_import';
  ansible_version: string | null;
  content: null;
}
