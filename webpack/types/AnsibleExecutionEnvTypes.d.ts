import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface Identifiable {
  id: number;
}

export interface ExecutionEnvContentUnit extends Identifiable {
  type: string;
  identifier: string;
  version: string;
}

export interface ExecutionEnvironment extends Identifiable {
  name: string;
  source: 'image_build' | 'image_import';
  container_image_url: string;
  ansible_version: string | null;
  latest_task_id: number;
  status: 'running' | 'success' | 'failed';
  content: AnsibleContentUnitAssignment[] | null;
}

export interface ExecutionEnvironmentBuilt extends ExecutionEnvironment {
  source: 'image_build';
  ansible_version: string;
  content: AnsibleContentUnitAssignment[];
}

export interface ExecutionEnvironmentDraft {
  name: string;
  container_image_url: string;
  ansible_version: string | null;
}
