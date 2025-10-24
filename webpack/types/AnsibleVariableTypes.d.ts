import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleVariable extends Identifiable {
  name: string;
  // eslint-disable-next-line camelcase
  default_value: string | boolean | number;
  type: AnsibleVariableType;
}

export type AnsibleVariableType =
  | 'string'
  | 'boolean'
  | 'integer'
  | 'real'
  | 'yaml';

export interface AnsibleVariableDetail extends AnsibleVariable {
  overrides: AnsibleVariableOverride[];
}

export interface AnsibleVariableOverrideCreate {
  value: string | boolean | number;
  matcher: 'fqdn' | 'hostgroup';
  // eslint-disable-next-line camelcase
  matcher_value: string;
}

export interface AnsibleVariableOverride
  extends AnsibleVariableOverrideCreate,
    Identifiable {}
