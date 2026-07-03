import {
  AnsibleContentUnitAssignment,
  FullAnsibleContentUnitAssignment,
} from './AnsibleContentTypes';

export interface AnsibleLcePath {
  id: number;
  name: string;
  description: string;
  lifecycle_environments: SparseAnsibleLce[];
}

export interface SparseAnsibleLce {
  id: number;
  name: string;
  description: string;
  position: number;
  content_hash: string;
  execution_environment?: ExecutionEnvironment;
}

export interface AnsibleLce extends SparseAnsibleLce {
  content: AnsibleContentUnitAssignment[];
}

export interface DenseAnsibleLce extends SparseAnsibleLce {
  content: FullAnsibleContentUnitAssignment[];
}

export interface ExecutionEnvironment {
  // TODO: Replace this with the actual type
  id: number;
  name: string;
}
