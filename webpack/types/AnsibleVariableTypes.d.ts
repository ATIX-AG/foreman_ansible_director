import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleVariable extends Identifiable {
  name: string;
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
  matcher_value: string;
}

export interface AnsibleVariableOverride
  extends AnsibleVariableOverrideCreate,
  Identifiable {}

export interface MergedVariableOverride {
  variable_id: string;
  key: string;
  type: AnsibleVariableType;
  default_value: string | boolean | number;
  overridable: boolean;
  override_id: string | null;
  override_matcher: string | null;
  override_value: string | boolean | number | null;
}
