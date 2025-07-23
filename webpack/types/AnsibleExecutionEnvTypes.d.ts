import { AnsibleContentUnitAssignment } from './AnsibleContentTypes';

export interface Identifiable {
  id: string;
}

export interface AnsibleExecutionEnvBase {
  name: string;
  // eslint-disable-next-line camelcase
  base_image_url: string;
  // eslint-disable-next-line camelcase
  ansible_version: string;
  // eslint-disable-next-line camelcase
  image_hash?: string;
  // eslint-disable-next-line camelcase
  image_url?: string;
  // eslint-disable-next-line camelcase
  last_built?: string;
  content: AnsibleContentUnitAssignment[];
}

export interface ExecutionEnvContentUnit extends Identifiable {
  type: string;
  identifier: string;
  version: string;
}

export interface AnsibleExecutionEnv
  extends Identifiable,
    AnsibleExecutionEnvBase {}

export interface AnsibleExecutionEnvCreate extends AnsibleExecutionEnvBase {}
