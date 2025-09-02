import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface AnsibleLcePath {
  id: number;
  name: string;
  description: string;
  // eslint-disable-next-line camelcase
  lifecycle_environments: SparseAnsibleLce[];
}

export interface SparseAnsibleLce {
  id: number;
  name: string;
  description: string;
  position: number;
  // eslint-disable-next-line camelcase
  content_hash: string;
  // eslint-disable-next-line camelcase
  execution_environment?: ExecutionEnvironment;
}

export interface AnsibleLce extends SparseAnsibleLce {
  content: AnsibleContentUnitAssignment[];
  // eslint-disable-next-line camelcase
  execution_environment?: ExecutionEnvironment;
}

export interface ExecutionEnvironment {
  // TODO: Replace this with the actual type
  id: number;
  name: string;
}
