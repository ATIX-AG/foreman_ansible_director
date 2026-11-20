export type resourceIdentifier =
  'execution_environment'
  | 'lifecycle_environment_path'
  | 'lifecycle_environment'
  | 'ansible_variable'
  | 'ansible_variable_binding';

export const resourceIdDisplayNameMap: Record<resourceIdentifier, string> = {
  execution_environment: 'Execution Environment',
  lifecycle_environment_path: 'lifecycle environment path',
  lifecycle_environment: 'lifecycle environment',
  ansible_variable: 'Ansible variable',
  ansible_variable_binding: 'Ansible variable binding',
};
