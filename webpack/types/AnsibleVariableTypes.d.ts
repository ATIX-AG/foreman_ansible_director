import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleVariable extends Identifiable {
  name: string;
  // eslint-disable-next-line camelcase
  default_value: string | boolean | number;
  type: AnsibleVariableType;
  overridable: boolean;
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

export interface MergedVariableOverride {
  // eslint-disable-next-line camelcase
  variable_id: string;
  key: string;
  type: AnsibleVariableType;
  // eslint-disable-next-line camelcase
  default_value: string | boolean | number;
  overridable: boolean;
  // eslint-disable-next-line camelcase
  override_id: string | null;
  // eslint-disable-next-line camelcase
  override_matcher: string | null;
  // eslint-disable-next-line camelcase
  override_value: string | boolean | number | null;
}
