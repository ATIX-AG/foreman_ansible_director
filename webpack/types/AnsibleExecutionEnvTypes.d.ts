import { AnsibleContentUnit } from './AnsibleContentTypes';

export interface Identifiable {
  id: number;
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
  content: AnsibleContentUnit[];
}

export interface AnsibleExecutionEnv
  extends Identifiable,
    AnsibleExecutionEnvBase {}

export interface AnsibleExecutionEnvCreate extends AnsibleExecutionEnvBase {}
