export type resourceIdentifier = 'execution_environment'
  | 'lifecycle_environment_path';

export const resourceIdDisplayNameMap: Record<resourceIdentifier, string> = {
  execution_environment: 'Execution Environment',
  lifecycle_environment_path: 'lifecycle environment path',
};
