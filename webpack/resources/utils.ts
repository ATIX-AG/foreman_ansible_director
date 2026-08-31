export type resourceIdentifier =
  'execution_environment'
  | 'lifecycle_environment_path'
  | 'ansible_variable'
  | 'ansible_variable_binding';

export const resourceIdDisplayNameMap: Record<resourceIdentifier, string> = {
  execution_environment: 'Execution Environment',
  lifecycle_environment_path: 'lifecycle environment path',
  ansible_variable: 'Ansible variable',
  ansible_variable_binding: 'Ansible variable binding',
};
