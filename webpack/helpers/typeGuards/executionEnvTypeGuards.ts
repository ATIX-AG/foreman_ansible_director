import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../types/AnsibleExecutionEnvTypes';

export const isAnsibleExecutionEnv = (
  env: AnsibleExecutionEnv | AnsibleExecutionEnvCreate
): env is AnsibleExecutionEnv => 'build_status' in env;
