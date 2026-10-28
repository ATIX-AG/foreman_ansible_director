import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../types/AnsibleExecutionEnvTypes';

export const isAnsibleExecutionEnv = (
  env: AnsibleExecutionEnv | AnsibleExecutionEnvCreate
): env is AnsibleExecutionEnv => 'status' in env;
