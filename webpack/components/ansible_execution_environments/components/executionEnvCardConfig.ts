import { ExecutionEnvironment } from '../../../types/AnsibleExecutionEnvTypes';

export type ExecutionEnvField =
  | 'name'
  | 'container_image_url'
  | 'ansible_version';

export interface ExecutionEnvCardConfig {
  editableFields: readonly ExecutionEnvField[];
  rebuildsOnChange: boolean;
}

export const allExecutionEnvFields: readonly ExecutionEnvField[] = [
  'name',
  'container_image_url',
  'ansible_version',
];

export const executionEnvCardConfigs: Record<
  ExecutionEnvironment['source'],
  ExecutionEnvCardConfig
> = {
  image_build: {
    editableFields: allExecutionEnvFields,
    rebuildsOnChange: true,
  },
  // Foreman neither builds an imported image nor inspects its contents, so the
  // only user-controllable attribute is the name it is listed under
  image_import: {
    editableFields: ['name'],
    rebuildsOnChange: false,
  },
};
